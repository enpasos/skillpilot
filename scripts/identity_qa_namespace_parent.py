#!/usr/bin/env python3
"""Closed immediate prepared-role membership; no Source-A/QA acceptance.

This proves only a missing Node dependency-search DIRECTORY in the selected
actual RO role root. It never authorizes a missing payload read, an arbitrary
``node_modules`` basename, or an ancestor outside that one bound directory.
"""
import hashlib
import json
import os
from pathlib import Path
import stat
from types import MappingProxyType

from identity_qa_private_capture import require
from identity_qa_read_trace import RuntimeObservationContract, calls, c_string, number
from identity_qa_tool_tree import _event_key

_PARENT = object()
_BOUND = object()


def _stable(value):
    return json.dumps(value,sort_keys=True,separators=(',',':')).encode()


def _membership(root):
    """Complete *immediate* membership; do not follow aliases or mountstubs."""
    rows=[]
    for path in sorted(root.iterdir()):
        info=path.lstat()
        row={'name':path.name}
        if stat.S_ISDIR(info.st_mode):row['kind']='directory'
        elif stat.S_ISLNK(info.st_mode):row.update(kind='symlink',target=os.readlink(path))
        elif stat.S_ISREG(info.st_mode):
            raw=path.read_bytes();row.update(kind='file',bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
        else:raise ValueError('Unsupported prepared parent member type: '+path.name)
        rows.append(row)
    return rows


def _verify_source_overlays(view,receipt):
    require(not receipt['binaryReadOnlyMounts'],
            'Prepared parent has source overlays not represented by this readonly namespace adapter')
    # The unchanged preparer always declares its asset forests, even with no
    # selected assets. Only actual empty source/target equivalence is enough;
    # selectedFiles=0 alone does not establish directory membership.
    for row in receipt.get('directoryReadOnlyMounts',[]):
        require(row['rootRole'] in view._roles,'Unknown asset-forest role')
        source=Path(row['hostPath']);target=view._roles[row['rootRole']]/row['path']
        require(row['selectedFiles']==0 and source.resolve(strict=True)==source
                and source.is_relative_to(view._capture._private_root)
                and target.resolve(strict=True)==target and target.is_relative_to(view._roles[row['rootRole']])
                and source.is_dir() and target.is_dir()
                and not any(source.iterdir()) and not any(target.iterdir()),
                'Prepared parent has source overlays not represented by this readonly namespace adapter')


class PreparedNamespaceParent:
    __slots__=('_token','_view','root','role','_rows_bytes','_identity','_protected','_source_paths')

    def __init__(self,token,view):
        require(token is _PARENT,'Actual factory-minted prepared parent is required')
        view.verify();root=view._roles[view.role];info=root.lstat()
        receipt=view._capture.prepared_receipt()
        _verify_source_overlays(view,receipt)
        proof=json.loads((view._capture._private_root/'source-a.json').read_bytes())
        sources={row['path'] for row in proof['catalog']['sourceFiles']}
        sources.update(row['path'] for row in proof.get('documents',[]))
        protected={row['path'] for row in receipt['selectedFiles']}
        protected.update(receipt['detachedOutputPaths'])
        object.__setattr__(self,'_token',token);object.__setattr__(self,'_view',view)
        object.__setattr__(self,'root',root);object.__setattr__(self,'role',view.role)
        object.__setattr__(self,'_rows_bytes',_stable(_membership(root)))
        object.__setattr__(self,'_identity',(info.st_dev,info.st_ino))
        object.__setattr__(self,'_protected',frozenset(protected))
        object.__setattr__(self,'_source_paths',frozenset(sources))

    def __setattr__(self,name,value):raise TypeError('Prepared parent capability is immutable')

    def verify(self):
        require(self._token is _PARENT,'Actual prepared parent capability is required')
        self._view.verify();info=self.root.lstat()
        _verify_source_overlays(self._view,self._view._capture.prepared_receipt())
        require(stat.S_ISDIR(info.st_mode) and (info.st_dev,info.st_ino)==self._identity,
                'Prepared parent identity/type changed')
        require(_stable(_membership(self.root))==self._rows_bytes,
                'Prepared parent complete immediate membership changed')
        return self

    def mount_binding(self):
        self.verify()
        return MappingProxyType({'source':str(self.root),'target':str(self.root),'readonly':True,
            'role':self.role,'membershipSha256':hashlib.sha256(self._rows_bytes).hexdigest(),
            'members':json.loads(self._rows_bytes),'preparationRawSha256':self._view._preparation_sha256})


def prepared_namespace_parents(views):
    require(set(views)=={'original','candidate'},'Both genuine prepared views are required')
    from identity_qa_namespace_view import require_namespace_view
    for role,view in views.items():require_namespace_view(view,view._roles[role],role)
    require(views['original']._capture is views['candidate']._capture,'Prepared parents belong to different captures')
    return MappingProxyType({role:PreparedNamespaceParent(_PARENT,view).verify() for role,view in views.items()})


def require_prepared_parent(value,root,role,views):
    require(type(value) is PreparedNamespaceParent and value._token is _PARENT,
            'Actual factory-minted prepared parent is required')
    require(value.root==Path(root) and value.role==role and value._view in views,
            'Prepared parent belongs to another role/root/capture')
    return value.verify()


class BoundNamespaceParent:
    __slots__=('_token','_parent','_launch','_events','_anchor','_search_directories')

    def __init__(self,token,parent,launch):
        require(token is _BOUND,'Actual launch-bound namespace parent is required')
        require(launch.tool_context['producerSha256']==RuntimeObservationContract.NODE_VM_EXECUTABLE_SHA256,
                'Prepared parent dependency search requires the bound actual Node executable')
        require(len(launch.argv)>1,'Actual Node module anchor is missing')
        view=parent._view;anchor=Path(launch.argv[1])
        require(view.contains(anchor),'Node entry module is outside the actual captured dependency view')
        mapped=view.lookup(anchor,(0,0,0,'openat',[],''))
        require(mapped.kind=='file' and mapped.physical_path.suffix in ('.js','.mjs','.cjs'),
                'Node entry anchor is not a captured JavaScript module')
        events=tuple(calls(launch.trace))
        require(any(event[3]=='openat' and not event[5].startswith('-1 ') and number(event[5])>=0
                    and c_string(event[4][1])==str(anchor) and 'O_RDONLY' in event[4][2] for event in events),
                'Actual trace did not load the captured Node entry module')
        # Node's ordinary ancestor module-search construction, anchored to the
        # actual captured entry module. No observed failed pathname is input.
        directories=tuple(directory/'node_modules' for directory in (anchor.parent,*anchor.parent.parents)
                          if directory.name!='node_modules')
        object.__setattr__(self,'_token',token);object.__setattr__(self,'_parent',parent)
        object.__setattr__(self,'_launch',launch);object.__setattr__(self,'_events',frozenset(_event_key(e) for e in events))
        object.__setattr__(self,'_anchor',mapped)
        object.__setattr__(self,'_search_directories',directories)

    def __setattr__(self,name,value):raise TypeError('Bound namespace parent is immutable')

    def verify(self,launch,contract=None):
        require(self._token is _BOUND and launch is self._launch,'Prepared parent belongs to another actual launch')
        from identity_qa_read_launcher import require_actual_launch
        require_actual_launch(launch,launch.trace,launch.cwd,launch.root,launch.role)
        parent=self._parent;parent.verify()
        require(parent.root==launch.root and parent.role==launch.role,'Prepared parent launch owner/root differs')
        binding=dict(parent.mount_binding())
        require(sum(dict(item)==binding for item in launch.readonly_namespace_parents)==1,
                'Exact readonly prepared parent mount/membership is absent or ambiguous')
        require(any(dict(item)==dict(parent._view.mount_binding()) for item in launch.readonly_dependency_mounts),
                'Actual Node dependency namespace mount is missing')
        if contract is not None:
            require(contract.root==parent.root and contract.role==parent.role,'Prepared parent contract differs')
            receipt=parent._view._capture.prepared_receipt()
            projected={row['path']:row for row in receipt['projectedDocumentBindings']}
            for row in receipt['selectedFiles']:
                path=row['path'];expected=projected[path] if parent.role=='candidate' and path in projected else row
                actual=contract.files.get(path)
                require(actual is not None and actual.sha256==expected['sha256'],
                        'Prepared parent lacks complete expected source/tool bindings: '+path)
                if path in parent._source_paths:
                    require(actual.category=='source','Prepared source/QA payload was reclassified as a tool: '+path)
        return self

    def contains(self,path):
        """One immediate controlled parent only; higher parents stay closed."""
        return Path(path).parent==self._parent.root

    def prove_negative_lookup(self,event,path,cwd):
        self.verify(self._launch)
        require(_event_key(event) in self._events,'Parent lookup is absent from actual launch trace')
        path=Path(path);start,end,pid,operation,args,result=event
        require(pid==self._launch.producer_boundary['hostPid'],
                'Parent dependency search is not the directly bound Node process')
        prior_execs=[e for e in calls(self._launch.trace) if e[2]==pid and e[0]<start
                     and e[3] in ('execve','execveat') and not e[5].startswith('-1 ')]
        require(prior_execs and prior_execs[-1][3]=='execve'
                and c_string(prior_execs[-1][4][0])==self._launch.argv[0],
                'Parent dependency search executable context changed')
        require(self.contains(path) and path in self._search_directories,
                'Lookup is outside the derived dependency search directory in the exact role parent')
        require(operation in ('stat','lstat','statx','newfstatat','access'),
                'Parent absence never authorizes a missing payload read')
        from identity_qa_tool_tree import negative_metadata_locator
        flags,at,pathname=negative_metadata_locator(event,path,cwd)
        parent=self._parent
        require(not any(path==parent.root/name or (parent.root/name).is_relative_to(path) for name in parent._protected),
                'Expected source/tool/output locator cannot be classified absent')
        members={row['name']:row for row in json.loads(parent._rows_bytes)}
        require(path.name not in members,'Existing parent member cannot prove absence')
        return {'category':'prepared-ro-parent-dependency-directory-absence','role':parent.role,
            'root':str(parent.root),'membershipSha256':hashlib.sha256(parent._rows_bytes).hexdigest(),
            'preparationRawSha256':parent._view._preparation_sha256,'launchTraceSha256':self._launch.trace_sha256,
            'nodeExecutableSha256':self._launch.tool_context['producerSha256'],
            'moduleAnchor':str(self._anchor.namespace_path),'moduleAnchorSha256':self._anchor.binding.sha256,
            'derivedSearchDirectories':[str(p) for p in self._search_directories],
            'pid':pid,'traceEntry':start,'cwd':str(cwd),'dirfd':args[0] if at else None,
            'requestedPath':pathname,'resolvedAttempt':str(path),'operation':operation,'flags':flags,'errno':'ENOENT',
            'firstMissingComponent':path.name,'sourceInput':False,'payloadReadAuthorized':False}


def bind_namespace_parent(parent,launch):
    require(type(parent) is PreparedNamespaceParent and parent._token is _PARENT,
            'Actual factory-minted prepared parent is required')
    from identity_qa_read_launcher import ReadLaunchEvidence,require_actual_launch
    require(type(launch) is ReadLaunchEvidence,'Actual factory-minted read-launch evidence is required')
    require_actual_launch(launch,launch.trace,launch.cwd,launch.root,launch.role)
    return BoundNamespaceParent(_BOUND,parent,launch).verify(launch)


def require_bound_parent(value,launch,contract):
    require(type(value) is BoundNamespaceParent and value._token is _BOUND,
            'Genuine actual launch-bound prepared parent is required')
    return value.verify(launch,contract)
