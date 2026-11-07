
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/stat.h>
static void readfile(const char *p){char b[100];int fd=open(p,O_RDONLY|O_CLOEXEC);if(fd>=0){read(fd,b,sizeof b);close(fd);}}
int main(int argc,char **argv){
 const char *mode=argv[1],*tree=argv[2];char p[4096];struct stat s;
 readfile(argv[3]);
 if(!strcmp(mode,"source-missing")){snprintf(p,sizeof p,"%s.missing",argv[3]);readfile(p);return 0;}
 if(!strcmp(mode,"unknown-root")){readfile(argv[4]);return 0;}
 if(!strcmp(mode,"write-flags")){snprintf(p,sizeof p,"%s/pkg/absent.json",tree);int fd=open(p,O_WRONLY|O_CLOEXEC);if(fd>=0)close(fd);return 0;}
 if(!strcmp(mode,"non-directory")){snprintf(p,sizeof p,"%s/pkg/package.json/no.json",tree);readfile(p);return 0;}
 if(!strcmp(mode,"wrong-errno")){snprintf(p,sizeof p,"%s/pkg/package.json",tree);access(p,W_OK);return 0;}
 snprintf(p,sizeof p,"%s/pkg/package.json",tree);readfile(p);
 snprintf(p,sizeof p,"%s/pkg/absent.json",tree);readfile(p);
 snprintf(p,sizeof p,"%s/pkg/missing-dir/deep.json",tree);stat(p,&s);
 snprintf(p,sizeof p,"%s/alias/absent.json",tree);readfile(p);
 return 0;
}
