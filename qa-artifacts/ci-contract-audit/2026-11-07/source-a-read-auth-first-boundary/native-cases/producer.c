
#include <unistd.h>
#include <fcntl.h>
#include <dirent.h>
#include <sys/wait.h>
#include <stdio.h>
#include <string.h>
static void consume(int fd){char b[4096];if(fd>=0){read(fd,b,sizeof b);close(fd);}}
static void file(const char *name){consume(open(name,O_RDONLY));}
int main(int argc,char **argv){
 if(argc>1&&!strcmp(argv[1],"emit-output")){write(1,"real native output\n",19);return 0;}
 char cwd[4096];getcwd(cwd,sizeof cwd);const char *mode=argv[1];
 if(!strcmp(mode,"host")){file(argv[2]);return 0;}
 if(!strcmp(mode,"escape")){file("escape/goal.json");return 0;}
 if(!strcmp(mode,"proc-alias")){int f=open("data/goal.json",O_RDONLY);char p[100];snprintf(p,sizeof p,"/proc/self/fd/%d",f);file(p);close(f);return 0;}
 if(!strcmp(mode,"write")){int f=open("data/goal.json",O_WRONLY|O_TRUNC);if(f>=0){close(f);return 9;}return 0;}
 if(!strcmp(mode,"fd-unbound")){int d=open("unselected",O_RDONLY|O_DIRECTORY);consume(openat(d,"goal.json",O_RDONLY));close(d);return 0;}
 int d=open("data",O_RDONLY|O_DIRECTORY);int q=fcntl(d,F_DUPFD_CLOEXEC,20);
 consume(openat(q,"goal.json",O_RDONLY));
 pid_t child=fork();
 if(!child){
  if(!strcmp(mode,"child-missing")){file("data/missing.config.json");_exit(0);}
  chdir(!strcmp(mode,"cwd-unbound")?"unselected":"other");
  file("goal.json");consume(openat(q,"goal.json",O_RDONLY));_exit(0);
 }
 waitpid(child,0,0);
 DIR *stream=fdopendir(d);while(readdir(stream));closedir(stream);
 file("alias/goal.json");file("data/space name.json");file("data/\303\244.json");
 file("tool/input.txt");file("dependency/input.txt");file("reports/generated.txt");close(q);
 return 0;
}
