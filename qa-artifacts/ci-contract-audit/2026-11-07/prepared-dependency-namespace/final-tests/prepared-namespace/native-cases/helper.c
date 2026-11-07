
#include <unistd.h>
#include <fcntl.h>
#include <dirent.h>
#include <sys/stat.h>
#include <stdio.h>
#include <string.h>
static void consume(int fd){char b[4096];if(fd>=0){read(fd,b,sizeof b);close(fd);}}
int main(int argc,char **argv){
 char goal[4096]={0},target[100]={0},cwd[4096];struct stat s;
 getcwd(cwd,sizeof cwd);
 int g=open("../curricula/DE/Gymnasium/canonical/fixture.json",O_RDONLY|O_CLOEXEC);int n=read(g,goal,sizeof(goal)-1);close(g);
 if(n<=0)return 2;
 int saved=open(".",O_RDONLY|O_DIRECTORY|O_CLOEXEC);
 int dir=open("node_modules/pkg",O_RDONLY|O_DIRECTORY|O_CLOEXEC);
 consume(openat(dir,"value.txt",O_RDONLY|O_CLOEXEC));
 fchdir(dir);getcwd(cwd,sizeof cwd);consume(open("value.txt",O_RDONLY|O_CLOEXEC));fchdir(saved);close(dir);close(saved);
 consume(open("node_modules/alias/value.txt",O_RDONLY|O_CLOEXEC));
 readlink("node_modules/alias",target,sizeof(target)-1);
 if(strcmp(target,"pkg"))return 3;
 stat("node_modules/pkg/value.txt",&s);
 stat("node_modules/pkg/missing.txt",&s);
 DIR *stream=opendir("node_modules");while(readdir(stream));closedir(stream);
 printf("%s\n",goal);return 0;
}
