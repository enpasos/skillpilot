#!/usr/bin/env python3
"""Private exact ELF/tool capture for a closed namespace, not Source-A/QA authority.

All paths in `entries` are namespace paths. `physical` regular files are fresh
private blobs, never host aliases. Symlink texts stay separate so callers can
materialize them inside a guest skeleton without resolving them through host /.
ELF decisions use readelf plus the exact loader's own --list, --help and
--list-diagnostics, not previous failed-open strings.

The legacy HWCAP powerset/order is the glibc2.35 algorithm in
https://raw.githubusercontent.com/bminor/glibc/release/2.35/master/elf/dl-hwcaps.c
(lines152-305); the local loader is required to identify itself as2.35.
"""
from __future__ import annotations
import argparse,glob,hashlib,itertools,json,os,posixpath,re,shutil,stat,subprocess
from pathlib import Path

NODE=Path('/home/enpasos/.nvm/versions/node/v20.20.2/bin/node')
NODE_SHA='6295488653f0d93b0a157841746fef7e72cc4328cfb60c4bbe0ca2668a836ffd'
REPO=Path('/home/enpasos/projects/skillpilot')
ESBUILD=REPO/'app/node_modules/@esbuild/linux-x64/bin/esbuild'
ENV={'PATH':'/usr/bin:/bin','LC_ALL':'C'}

def require(x,message):
    if not x: raise ValueError(message)

def sha(b):return hashlib.sha256(b).hexdigest()
def bytes_sha(p):return sha(Path(p).read_bytes())

def command(argv):
    p=subprocess.run([str(x)for x in argv],env=ENV,capture_output=True,text=True)
    require(p.returncode==0,'Tool inspection failed: '+repr(argv)+' '+p.stderr)
    return p.stdout,{'argv':[str(x)for x in argv],'environment':dict(ENV),'exitCode':p.returncode,
        'stdoutSha256':sha(p.stdout.encode()),'stderrSha256':sha(p.stderr.encode())}

def inspect_elf(path):
    p=Path(path);require(p.is_file()and p.read_bytes()[:4]==b'\x7fELF','Expected actual ELF file: '+str(p))
    header,hrec=command(['/usr/bin/readelf','--wide','--file-header',p])
    prog,prec=command(['/usr/bin/readelf','--wide','--program-headers',p])
    dyn,drec=command(['/usr/bin/readelf','--wide','--dynamic',p])
    interps=re.findall(r'Requesting program interpreter:\s*([^\]]+)\]',prog)
    require(len(interps)<=1,'Ambiguous PT_INTERP')
    return {'source':str(p),'sha256':bytes_sha(p),'bytes':p.stat().st_size,
        'elfClass':re.search(r'Class:\s*(\S+)',header).group(1),
        'machine':re.search(r'Machine:\s*(.+)',header).group(1).strip(),
        'interpreter':interps[0]if interps else None,
        'needed':re.findall(r'\(NEEDED\).*?\[([^\]]+)\]',dyn),
        'rpath':re.findall(r'\(RPATH\).*?\[([^\]]*)\]',dyn),
        'runpath':re.findall(r'\(RUNPATH\).*?\[([^\]]*)\]',dyn),
        'inspectionCommands':[hrec,prec,drec]}

def host_alias_chain(path):
    """Resolve component aliases explicitly and return their exact visible text."""
    path=posixpath.normpath(str(path));require(path.startswith('/'),'ELF source path must be absolute')
    links=[];seen=set()
    while True:
        require(path not in seen,'Cyclic tool path alias');seen.add(path)
        parts=Path(path).parts[1:]
        for i in range(1,len(parts)+1):
            prefix=Path('/').joinpath(*parts[:i])
            if prefix.is_symlink():
                target=os.readlink(prefix);require(target and '\0'not in target,'Invalid tool symlink')
                links.append({'visible':str(prefix),'kind':'symlink','target':target,
                    'sourcePhysical':str(prefix),'linkTextSha256':sha(target.encode())})
                path=posixpath.normpath(posixpath.join(target if target.startswith('/')else posixpath.join(str(prefix.parent),target),*parts[i:]));break
        else:
            require(Path(path).is_file(),'Unresolved required tool path '+path)
            return path,links

def _diagnostic_values(text):
    values={}
    for line in text.splitlines():
        if '='not in line:continue
        k,v=line.split('=',1)
        if k.startswith(('dl_','path.','dso.')):
            try:values[k]=json.loads(v)if v.startswith('"')else int(v,0)
            except (ValueError,json.JSONDecodeError):values[k]=v
    return values

def _loader_resolutions(text):
    result={}
    for line in text.splitlines():
        line=line.strip()
        if not line:continue
        m=re.fullmatch(r'(\S+)\s+=>\s+(\S+)\s+\(0x[0-9a-f]+\)',line)
        if m:
            name,path=m.groups();require(path.startswith('/')and Path(path).is_file(),'Unresolved listed library '+line)
            require(name not in result or result[name]==path,'Ambiguous native loader resolution');result[name]=path;continue
        m=re.fullmatch(r'(/\S+)\s+\(0x[0-9a-f]+\)',line)
        if m:
            path=m.group(1);result[Path(path).name]=path;continue
        require(re.fullmatch(r'linux-vdso\.so\.\d+\s+\(0x[0-9a-f]+\)',line),'Unrecognized loader-list line '+line)
    return result

def _config_closure(start='/etc/ld.so.conf'):
    pending=[Path(start)];seen={};directories=[]
    while pending:
        p=pending.pop();require(p.is_file(),'Missing actual loader config '+str(p))
        if str(p)in seen:continue
        raw=p.read_bytes();seen[str(p)]=raw
        for row in raw.decode().splitlines():
            row=row.split('#',1)[0].strip()
            if not row:continue
            if row.startswith('include '):
                pattern=row.split(None,1)[1];require(pattern.startswith('/'),'Nonabsolute loader config include')
                matches=sorted(glob.glob(pattern));require(matches,'Loader config include has no actual members');pending.extend(Path(n)for n in matches)
            else:
                require(row.startswith('/')and len(row.split())==1,'Unsupported loader configuration directive '+row)
                directories.append(posixpath.normpath(row))
    return seen,sorted(set(directories))

def _search_suffixes(help_text,diag):
    require('Legacy HWCAP subdirectories' in help_text,'Native loader lacks required HWCAP help profile')
    tail=help_text.split('Legacy HWCAP subdirectories under library search path directories:',1)[1]
    active=[];platform_name=None
    for line in tail.splitlines():
        m=re.fullmatch(r'\s+(\S+)\s+\(([^)]*)\)',line)
        if not m or 'supported, searched'not in m.group(2):continue
        name,description=m.groups()
        if 'AT_PLATFORM'in description:platform_name=name
        elif name!='tls':active.append(name)
    require(platform_name in (None,diag.get('dl_platform')),'Loader platform help/diagnostic mismatch')
    # glibc2.35 constructs HWCAP names in ascending bit order, then platform,
    # then TLS, and emits combinations in reversed temporary-array order.
    # For this exact local ELF64/x86-64 loader there is one active named bit.
    require(active==['x86_64'],'Unreviewed legacy HWCAP bit/order profile: '+repr(active))
    legacy_order=['tls']+([platform_name]if platform_name else [])+list(reversed(active))
    legacy=[]
    for mask in range((1<<len(legacy_order))-1,-1,-1):
        legacy.append('/'.join(name for i,name in enumerate(legacy_order)if mask&(1<<(len(legacy_order)-1-i))))
    modern=[]
    for line in help_text.split('Subdirectories of glibc-hwcaps directories, in priority order:',1)[1].split('Legacy HWCAP',1)[0].splitlines():
        m=re.fullmatch(r'\s+(\S+)\s+\(([^)]*)\)',line)
        if m and 'supported, searched'in m.group(2):modern.append('glibc-hwcaps/'+m.group(1))
    names=diag.get('dl_hwcaps_subdirs','').split(':');mask=diag.get('dl_hwcaps_subdirs_active',0)
    expected=['glibc-hwcaps/'+n for i,n in enumerate(names)if mask&(1<<i)]
    require(modern==expected,'Modern HWCAP diagnostic mask/help mismatch')
    return modern+legacy,{'modernActive':modern,'legacyNames':legacy_order,'legacyPowerSet':legacy,
        'versionedAlgorithm':'glibc2.35 elf/dl-hwcaps.c, reviewed ordered powerset; actual executable/library bindings remain separate'}

def _expanded_paths(metadata,visible,diag):
    out=[]
    for field in ('rpath','runpath'):
        for group in metadata[field]:
            for value in group.split(':'):
                require(value,'Empty ELF search path would depend on cwd')
                value=value.replace('${ORIGIN}',str(Path(visible).parent)).replace('$ORIGIN',str(Path(visible).parent))
                value=value.replace('${LIB}',diag['dl_dst_lib']).replace('$LIB',diag['dl_dst_lib'])
                value=value.replace('${PLATFORM}',diag['dl_platform']).replace('$PLATFORM',diag['dl_platform'])
                require('$'not in value and value.startswith('/'),'Unsupported ELF search expansion')
                out.append({'kind':field,'path':posixpath.normpath(value)})
    return out

def capture_tools(destination):
    destination=Path(destination).absolute();require(not destination.is_symlink(),'Capture root cannot be an alias')
    destination.mkdir(parents=True,exist_ok=True,mode=0o700);blobs=destination/'blobs';blobs.mkdir(exist_ok=True)
    require(bytes_sha(NODE)==NODE_SHA,'Actual pinned Node differs')
    require(ESBUILD.is_file(),'Installed esbuild executable missing')
    root_specs=[(NODE,'/qa/toolchain/bin/node'),(ESBUILD,'/qa/toolchain/bin/esbuild')]
    first=inspect_elf(NODE);require(first['interpreter'],'Node has no PT_INTERP')
    loader=Path(first['interpreter']);loader_real,_=host_alias_chain(loader)
    version,vrec=command([loader,'--version']);require('stable release version 2.35.'in version,'Unreviewed loader algorithm/version')
    diagnostics,drec=command([loader,'--list-diagnostics']);diag=_diagnostic_values(diagnostics)
    help_text,hrec=command([loader,'--help']);suffixes,hwcap=_search_suffixes(help_text,diag)
    defaults=[v.rstrip('/')or'/'for k,v in diag.items()if re.fullmatch(r'path\.system_dirs\[0x[0-9a-f]+\]',k)]
    require(defaults,'Missing diagnostic default search directories')
    cache,crec=command(['/sbin/ldconfig','-p']);cache_rows=[]
    for row in cache.splitlines()[1:]:
        if row.startswith('Cache generated by: ldconfig ')and 'stable release version 2.35'in row:continue
        m=re.fullmatch(r'\s*(\S+)\s+\(([^)]*)\)\s+=>\s+(\S+)\s*',row)
        require(m,'Unrecognized actual ldconfig cache row '+row)
        cache_rows.append(dict(zip(('soname','abi','path'),m.groups())))
    config,configdirs=_config_closure()
    entries={};metadata={};root_profiles=[];edges=[];optional={};commands=[vrec,drec,hrec,crec];source_pins={};bindings={}
    def capture_file(source,visible,category,basis):
        require(visible.startswith('/')and posixpath.normpath(visible)==visible,'Unsafe visible tool locator')
        raw=Path(source).read_bytes();info=Path(source).stat();digest=sha(raw);private=blobs/digest
        if private.exists():require(private.is_file()and not private.is_symlink()and bytes_sha(private)==digest,'Private blob changed')
        else:
            require(shutil.disk_usage(destination).free-len(raw)>256_000_000,'Tool capture RAM reserve would be exhausted')
            fd=os.open(private,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o500 if info.st_mode&0o111 else 0o400)
            with os.fdopen(fd,'wb')as stream:stream.write(raw);stream.flush();os.fsync(stream.fileno())
        require(private.stat().st_nlink==1,'Private capture blob has external hardlink alias')
        record={'visible':visible,'physical':str(private),'kind':'file','sha256':digest,'bytes':len(raw),'executable':bool(info.st_mode&0o111),
            'mode':stat.S_IMODE(private.stat().st_mode),'category':category,'provenance':basis,'sourcePhysical':str(source),
            'sourceResolved':str(Path(source).resolve()),'privateDevice':private.stat().st_dev,'privateInode':private.stat().st_ino}
        if visible in entries:require(entries[visible]['kind']=='file'and entries[visible]['sha256']==digest,'Conflicting visible tool bytes')
        else:entries[visible]=record
        source_pins[str(source)]=digest;return record
    def capture_system(source,category,basis):
        terminal,aliases=host_alias_chain(source)
        for a in aliases:
            a.update(category=category,provenance='Exact actual system tool symlink, not a source rewrite')
            if a['visible']in entries:require(entries[a['visible']]['kind']=='symlink'and entries[a['visible']]['target']==a['target'],'Conflicting tool alias')
            else:entries[a['visible']]=a
        return capture_file(terminal,terminal,category,basis)
    for p in [Path('/etc/ld.so.cache'),Path('/etc/ssl/openssl.cnf')]:capture_system(p,'tool-config','Exact native loader/Node configuration')
    for p in config:capture_system(p,'tool-config','Actual ld.so.conf include closure; not runtime directory read permission')
    preload=Path(diag['path.sysconfdir'])/'ld.so.preload'
    optional_configs=[]
    if preload.exists():capture_system(preload,'tool-config','Actual system loader preload configuration')
    else:optional_configs.append({'path':str(preload),'expectedErrno':'ENOENT','basis':'glibc loader exact optional preload configuration under diagnostic sysconfdir; closed parent membership still required'})
    for source,visible in root_specs:
        root_binding=capture_file(source,visible,'tool-executable','Explicit native root executable private capture')
        initial=inspect_elf(source);require(initial['elfClass']=='ELF64'and initial['machine']=='Advanced Micro Devices X86-64','Unreviewed ELF ABI')
        # Relocated executable-origin search paths require separate namespace-native
        # resolver proof. This exact pinned Node and esbuild have none.
        require(not initial['rpath']and not initial['runpath'],'Relocated root ELF RPATH/RUNPATH needs separately verified guest resolution')
        resolution={};listing_rec=None;listing=''
        if initial['interpreter']:
            require(initial['interpreter']==str(loader),'Additional executable uses another loader')
            capture_system(loader,'tool-loader','Actual PT_INTERP from bound executable')
            listing,listing_rec=command([loader,'--list',source]);commands.append(listing_rec);resolution=_loader_resolutions(listing)
        else:require(not initial['needed'],'DT_NEEDED without a supported PT_INTERP')
        queue=[(source,visible)];seen=set();profile_edges=[]
        # Loader-listed objects include complete transitive/preload closure. They
        # must all be real captured ELFs, rather than merely permitted prefixes.
        for soname,p in resolution.items():
            terminal,_=host_alias_chain(p);queue.append((Path(terminal),terminal));capture_system(p,'tool-library','Actual pinned-loader --list resolution')
        while queue:
            physical,loc=queue.pop()
            if str(physical.resolve())in seen:continue
            seen.add(str(physical.resolve()));m=inspect_elf(physical);metadata.setdefault(loc,m)
            if physical==source:pass
            else:capture_system(physical,'tool-library','Actual transitive ELF DT_NEEDED object')
            for name in m['needed']:
                require('/'not in name,'Path-valued DT_NEEDED requires a separately bound loader rule')
                require(name in resolution,'Required transitive library is not resolved by the actual root loader: '+name)
                resolved=resolution[name];terminal,_=host_alias_chain(resolved);child=capture_system(resolved,'tool-library','Actual transitive DT_NEEDED resolution')
                edge={'rootExecutable':visible,'rootExecutableSha256':root_binding['sha256'],'parentElf':loc,'parentElfSha256':m['sha256'],
                    'needed':name,'resolvedVisible':resolved,'resolvedCanonical':terminal,'resolvedSha256':child['sha256']}
                edges.append(edge);profile_edges.append(edge);queue.append((Path(terminal),terminal))
                searches=_expanded_paths(m,loc,diag)+[{'kind':'loader-default','path':p}for p in defaults]
                # Cache entries for this exact required SONAME are finite and ABI-bound.
                cache_for_name=[r for r in cache_rows if r['soname']==name and r['abi']=='libc6,x86-64']
                for r in cache_for_name:
                    searches.append({'kind':'cache-soname-parent','path':str(Path(r['path']).parent)})
                for search in searches:
                    for suffix in suffixes:
                        candidate=posixpath.normpath(posixpath.join(search['path'],suffix,name))
                        fact={'path':candidate,'soname':name,'rootExecutable':visible,'rootExecutableSha256':root_binding['sha256'],
                            'parentElf':loc,'parentElfSha256':m['sha256'],'searchKind':search['kind'],'searchDirectory':search['path'],
                            'hwcapSuffix':suffix,'requiredResolvedPath':resolved,'requiredResolvedSha256':child['sha256'],
                            'cacheSha256':entries['/etc/ld.so.cache']['sha256'],'basis':'DT_NEEDED plus actual loader/cache/HWCAP algorithm; no observed miss string'}
                        optional.setdefault(candidate,[]).append(fact)
        root_profiles.append({'visibleExecutable':visible,'physicalExecutable':str(source),'sha256':root_binding['sha256'],'elf':initial,
            'actualLoaderList':listing,'actualLoaderListCommand':listing_rec,'transitiveObjectCount':len(seen),
            'equivalentDependencyExecutableAliases':(['/qa/pair/'+r+'/app/node_modules/@esbuild/linux-x64/bin/esbuild'for r in ['original80','projectedA80']]if source==ESBUILD else []),
            'transitiveEdges':profile_edges})
    optional_directories={}
    for candidate,origins in optional.items():
        for origin in origins:
            if origin['hwcapSuffix']:
                directory=posixpath.normpath(posixpath.join(origin['searchDirectory'],origin['hwcapSuffix']))
                optional_directories.setdefault(directory,[]).append({k:origin[k]for k in ['rootExecutable','rootExecutableSha256','parentElf','parentElfSha256','searchDirectory','hwcapSuffix']})
    required_paths=set(entries)
    # Existing bound paths (including alias locators and resolved objects) can
    # never be treated as optional absence, even if they are search candidates.
    optional={p:rows for p,rows in optional.items()if p not in required_paths}
    directories=set(['/'])
    for visible in entries:
        directories.update(str(p)for p in Path(visible).parents)
    # Directory names below an absent optional HWCAP directory are not created:
    # the caller's actual RO membership proof identifies the first absent member.
    for source,digest in source_pins.items():require(bytes_sha(source)==digest,'Host tool changed during capture: '+source)
    for rec in entries.values():
        if rec['kind']=='file':require(bytes_sha(rec['physical'])==rec['sha256']and Path(rec['physical']).stat().st_nlink==1,'Private tool bytes/inode alias changed')
        else:require(os.readlink(rec['sourcePhysical'])==rec['target'],'Tool symlink text changed')
    for p in ['/usr/bin/readelf','/sbin/ldconfig',str(loader_real)]:bindings[p]={'sha256':bytes_sha(p),'bytes':Path(p).stat().st_size}
    report={'format':'closed-namespace-elf-capture/v1','purpose':'native tool closure and structural optional loader candidates; no Source-A/QA authorization',
        'destination':str(destination),'entries':sorted(entries.values(),key=lambda r:r['visible']),
        'requiredDirectories':sorted(directories),'rootExecutables':root_profiles,'node':next(r for r in root_profiles if r['visibleExecutable'].endswith('/node')),
        'elfFamilies':{'kind':'separate exact tool-loader family; never Source/dependency metadata blanket',
            'interpreter':str(loader),'loaderSha256':bytes_sha(loader_real),'loaderVersion':version.splitlines()[0],
            'requiredLoaderEnvironment':{'LD_LIBRARY_PATH':None,'LD_PRELOAD':None,'LD_AUDIT':None,'GLIBC_TUNABLES':None},
            'loaderDiagnostics':diag,'loaderDiagnosticsCommand':drec,'loaderHelpCommand':hrec,'defaultSearchDirectories':defaults,
            'hwcap':hwcap,'suffixes':suffixes,'optionalCandidates':[{'path':p,'origins':origins}for p,origins in sorted(optional.items())],
            'optionalDirectoryCandidates':[{'path':p,'origins':rows,'payloadReadAuthorized':False}for p,rows in sorted(optional_directories.items())],
            'optionalConfigurations':optional_configs,'protectedRequiredPaths':sorted(required_paths),'transitiveEdges':edges,
            'loaderConfigDirectories':configdirs,'loaderConfigDirectoriesDoNotAuthorizeRuntimeDirectoryPrefixes':True},
        'toolInspectionCommands':commands,'controllerInspectionToolBindings':bindings,
        'capturedBytes':sum(p.stat().st_size for p in blobs.iterdir()),'sourceFilesReadAndRechecked':source_pins,
        'limits':['Source-A basis, semantic QA, actual mount fidelity and syscall/process ownership are separate capabilities.',
            'Optional candidates require actual ENOENT with readonly flags, current bound executable/ELF context, an unchanged complete RO parent and later actual successful required-library binding; this JSON alone grants no lookup capability.',
            'Native addon/dlopen/NSS inputs not in these explicit Node/esbuild root closures remain unbound and must fail closed if encountered.',
            'Static esbuild executable aliases are byte-bound but parent launcher must prove its actual argv/process lineage.',
            'Root executables with RPATH/RUNPATH after relocation or another ELF ABI/loader version are rejected; no claim of a general multi-platform ELF resolver.']}
    manifest=destination/'capture.json';tmp=destination/'capture.json.new';tmp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');os.replace(tmp,manifest)
    return report

def main():
    parser=argparse.ArgumentParser();parser.add_argument('destination',nargs='?',default='/dev/shm/source-a-closed-namespace-native-candidate-20261107/captured-tools');a=parser.parse_args()
    r=capture_tools(a.destination);print(json.dumps({'captureManifest':str(Path(a.destination)/'capture.json'),'capturedBytes':r['capturedBytes'],'entries':len(r['entries']),'roots':len(r['rootExecutables']),'transitiveEdges':len(r['elfFamilies']['transitiveEdges']),'optionalCandidates':len(r['elfFamilies']['optionalCandidates']),'sourceAOrQaPass':False},indent=2))
if __name__=='__main__':main()
