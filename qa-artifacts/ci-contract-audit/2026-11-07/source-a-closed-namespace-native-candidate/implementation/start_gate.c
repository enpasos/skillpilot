// SPDX-License-Identifier: Apache-2.0
// Trusted fixed bootstrap, not a producer and not a source/QA authority.
#include <stdio.h>
#include <signal.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/syscall.h>
int main(int argc,char**argv){if(argc<2)return 90; if(syscall(SYS_close_range,3,~0U,0))return 93;printf("NAMESPACE_GATE_READY:%d\n",getpid());fflush(stdout);if(raise(SIGSTOP))return 91;execv(argv[1],argv+1);perror("controlled exec");return 92;}
