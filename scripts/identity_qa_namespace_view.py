#!/usr/bin/env python3
"""Actual prepared dependency mounts; no Source-A/QA readiness capability."""
from dataclasses import dataclass
import fcntl
import os
from pathlib import Path
import re
import stat
from types import MappingProxyType

from identity_qa_private_capture import require
from identity_qa_read_trace import FileBinding,c_string
from identity_qa_tool_tree import bind_prepared_dependency_capture

_VIEW = object()
_LEASE = object()


class PreparedLaunchLease:
    __slots__=('_token','_fd','_base','_device_inode')

    def __init__(self,token,fd,base):
        require(token is _LEASE,'Actual preparation lock lease is required')
        info=os.fstat(fd)
        object.__setattr__(self,'_token',token);object.__setattr__(self,'_fd',fd);object.__setattr__(self,'_base',base)
        object.__setattr__(self,'_device_inode',(info.st_dev,info.st_ino))

    def __setattr__(self,name,value):
        raise TypeError('Preparation lock lease is immutable')

    def verify(self,views):
        require(self._token is _LEASE,'Actual preparation lock lease is required')
        info=os.fstat(self._fd);path_info=(self._base/'.preparation.lock').lstat()
        require(stat.S_ISREG(info.st_mode) and (info.st_dev,info.st_ino)==self._device_inode==(path_info.st_dev,path_info.st_ino),
                'Preparation lock descriptor/path changed')
        require(all(view._capture._private_root==self._base for view in views),'Preparation lease belongs to another pair')
        return self


@dataclass(frozen=True)
class NamespaceInput:
    namespace_path: Path
    physical_path: Path
    logical: str
    kind: str
    binding: FileBinding | None
    children: tuple | None = None


class PreparedDependencyView:
    """Private capture + exact preparation and namespace target, not a flag."""
    __slots__ = ('_token','_capture','role','visible_root','_roles','_entries','_preparation_sha256')

    def __init__(self, token, capture, role):
        require(token is _VIEW, 'An actual prepared dependency view is required')
        receipt = capture.prepared_receipt()
        roles = {name:Path(receipt[field]) for name,field in (('original','originalRoot'),('candidate','candidateRoot'))}
        object.__setattr__(self,'_token',token)
        object.__setattr__(self,'_capture',capture)
        object.__setattr__(self,'role',role)
        object.__setattr__(self,'_roles',MappingProxyType(roles))
        object.__setattr__(self,'visible_root',roles[role]/'app/node_modules')
        object.__setattr__(self,'_preparation_sha256',capture._prepared_binding[1])
        object.__setattr__(self,'_entries',MappingProxyType({r['path']:MappingProxyType(r) for r in capture.receipt()['entries']}))

    def __setattr__(self,name,value):
        raise TypeError('Prepared namespace view is immutable')

    def verify(self):
        self._capture.verify()
        root = self._roles[self.role]
        require(root.resolve(strict=True) == root, 'Prepared role root is aliased')
        for path in (root/'app',self.visible_root):
            require(path.is_dir() and not path.is_symlink(), 'Prepared dependency target is not a real directory')
        require(not any(self.visible_root.iterdir()), 'Dependency mount would hide unbound host-stub inputs')
        return self

    def verify_for_launch(self,root,role):
        self.verify()
        require(role in self._roles and Path(root) == self._roles[role], 'Namespace view belongs to another prepared pair/role')
        return self

    def mount_binding(self):
        self.verify()
        return MappingProxyType({**self._capture.mount_binding(),'target':str(self.visible_root),
            'viewRole':self.role,'preparationRawSha256':self._preparation_sha256})

    def contains(self,path):
        return Path(path).is_relative_to(self.visible_root)

    def walk(self,path,follow_final=True):
        require(self.contains(path), 'Path is outside this exact namespace dependency mount')
        pending=list(Path(path).relative_to(self.visible_root).parts)
        current,aliases,seen=[],[],set()
        while pending:
            state=(tuple(current),tuple(pending))
            require(state not in seen,'Namespace dependency alias cycle')
            seen.add(state)
            part=pending.pop(0)
            if part=='.':continue
            if part=='..':
                require(current,'Namespace dependency locator leaves the bound mount')
                current.pop();continue
            relative='/'.join([*current,part]);row=self._entries.get(relative)
            require(row is not None,'Unbound namespace dependency input: '+relative)
            if row['kind']=='symlink' and (pending or follow_final):
                target=row['target'];require(target and not target.startswith('/'),'Namespace alias is not internal')
                aliases.append((relative,target));pending=list(Path(target).parts)+pending
            elif row['kind']=='directory':current.append(part)
            else:
                require(not pending,'Namespace dependency traversal crosses a non-directory')
                return relative,row,tuple(aliases)
        relative='/'.join(current)
        return relative,self._entries.get(relative,{'path':'','kind':'directory'}),tuple(aliases)

    def lookup(self,path,event,actual=None):
        require(self.contains(path),'Path is not this namespace mount')
        _,_,_,operation,args,_=event
        nofollow=operation in ('lstat','readlink','readlinkat') or (operation in ('newfstatat','statx') and 'AT_SYMLINK_NOFOLLOW' in ','.join(args))
        relative,row,_=self.walk(path,follow_final=not nofollow)
        namespace=self.visible_root/relative;physical=self._capture.root/relative
        require(actual is None or Path(actual)==namespace,'Kernel FD identity differs from actual namespace mount')
        if operation in ('execve','execveat'):
            require(row['kind']=='file' and row['executable'],'Namespace executable type/permission differs from capture')
        if operation in ('readlink','readlinkat'):
            target=c_string(args[1] if operation=='readlink' else args[2])
            require(row['kind']=='symlink' and target==row['target'],'Actual namespace readlink text differs from capture')
        if operation in ('stat','lstat','newfstatat','statx'):
            modes=re.findall(r'(?:stx_mode|st_mode)=(S_IF\w+)',','.join(args))
            require(modes and modes[-1]=={'file':'S_IFREG','directory':'S_IFDIR','symlink':'S_IFLNK'}[row['kind']],
                    'Actual namespace stat type differs from capture')
        binding=FileBinding('dependency',row['sha256'],'prepared namespace dependency capture '+self._capture._tree_sha256) if row['kind']=='file' else None
        prefix=relative+'/' if relative else ''
        children=tuple(sorted((name[len(prefix):],entry['kind']) for name,entry in self._entries.items()
                              if name.startswith(prefix) and '/' not in name[len(prefix):])) if row['kind']=='directory' else None
        return NamespaceInput(namespace,physical,'dependency:'+self.role+':'+relative,row['kind'],binding,children)

    def declared_executable(self,path):
        """Prelaunch declaration; actual exec is separately checked in trace."""
        self.verify()
        return self.lookup(path,(0,0,0,'execve',[],''))


def prepared_dependency_views(preparation_path,accepted_preparation_sha256,accepted_tree_sha256,snapshot):
    capture=bind_prepared_dependency_capture(preparation_path,accepted_preparation_sha256,accepted_tree_sha256,snapshot)
    return MappingProxyType({role:PreparedDependencyView(_VIEW,capture,role).verify() for role in ('original','candidate')})


def require_namespace_view(value,root,role):
    require(type(value) is PreparedDependencyView and value._token is _VIEW,'Actual factory-minted namespace view is required')
    return value.verify_for_launch(root,role)


def require_prepared_lease(value,views):
    require(type(value) is PreparedLaunchLease and value._token is _LEASE,'Genuine preparation lock lease is required')
    return value.verify(views)


def run_prepared_namespace(role,views,argv,evidence_directory,namespace_parent=None):
    """Existing actual receipt/capture layout under the existing pair lock.

    Sources/dependencies stay RO. This small adapter does not enable generated
    outputs, original-QA joins or Source-A readiness.
    """
    require(set(views)=={'original','candidate'},'Both actual prepared dependency views are required')
    current=views[role]
    root=current._roles[role]
    selected=tuple(require_namespace_view(view,root,role) for view in views.values())
    require(all(view._capture is current._capture for view in selected),'Prepared namespace views belong to different captures')
    base=current._capture._private_root
    fd=os.open(base/'.preparation.lock',os.O_RDWR|os.O_CREAT|os.O_NOFOLLOW|os.O_CLOEXEC,0o600)
    try:
        fcntl.flock(fd,fcntl.LOCK_EX|fcntl.LOCK_NB)
        lease=PreparedLaunchLease(_LEASE,fd,base)
        for view in selected:view.verify()
        from identity_qa_read_launcher import run_readonly
        return run_readonly(role,root,root/'app',argv,evidence_directory,
                            dependency_views=selected,prepared_lease=lease,namespace_parent=namespace_parent)
    finally:
        os.close(fd)
