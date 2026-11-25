#!/usr/bin/env bash
set -eu
p=/tmp/e1-regroup-r2-runtime
unshare -Ur -m bash "$p/private.sh" "$p/history.native.sh"
