#!/usr/bin/env bash
# APT::Update::Pre-Invoke hook for the mirror lists written by render-ubuntu-sources.sh
# (installed by action.yml, configured in apt.conf). Usage: order-ubuntu-mirrors.sh <dir>
#
# APT's mirror transport moves each file to the next mirror when a source fails, but
# every file first tries priority 1: a source that refuses connections costs nothing,
# one that never answers a connection attempt costs one timeout per apt-get run, but one
# that accepts connections and then stalls costs the full timeout for every single file.
# So before each `apt-get update`, this hook probes the entries of every list (its
# "# probe:" file; all probes start in parallel and curl bounds each of them) and gives
# priority 1 to the first entry in line order that answers; the others follow in line
# order. When no entry answers, the line order is kept. Only priorities change, never
# the sources. The hook must not fail the update: on any problem the lists stay as they are.
set -uo pipefail

mirror_dir=${1:-/etc/apt/skillpilot-ubuntu-mirrors}
connect_timeout=${SKILLPILOT_APT_PROBE_CONNECT_TIMEOUT:-10}
max_time=${SKILLPILOT_APT_PROBE_MAX_TIME:-20}

log() { printf 'SkillPilot Ubuntu mirror order: %s\n' "$*"; }
probe_path() { sed -n 's/^# probe: //p' "$1" | head -n 1; }
entries() { grep -v -e '^#' -e '^[[:space:]]*$' "$1" | cut -f 1 | cut -d ' ' -f 1; }

if ! command -v curl > /dev/null 2>&1; then
  log "curl is missing, keeping the current order"
  exit 0
fi
shopt -s nullglob
lists=("$mirror_dir"/*.txt)
if (( ${#lists[@]} == 0 )); then
  log "no mirror lists in $mirror_dir"
  exit 0
fi

declare -A probe_pid
for i in "${!lists[@]}"; do
  probe=$(probe_path "${lists[$i]}")
  [[ -n $probe ]] || continue
  j=0
  while IFS= read -r uri; do
    curl --silent --fail --output /dev/null --connect-timeout "$connect_timeout" \
      --max-time "$max_time" "${uri%/}/$probe" &
    probe_pid[$i.$j]=$!
    j=$((j + 1))
  done < <(entries "${lists[$i]}")
done

for i in "${!lists[@]}"; do
  list=${lists[$i]}
  name=${list##*/}
  mapfile -t uris < <(entries "$list")
  if [[ -z $(probe_path "$list") ]] || (( ${#uris[@]} == 0 )); then
    log "$name has no probe file or entries, keeping its order"
    continue
  fi
  # Wait in line order and stop at the first entry that answers.
  first=-1
  for j in "${!uris[@]}"; do
    if wait "${probe_pid[$i.$j]}"; then
      first=$j
      break
    fi
  done
  for (( j = first + 1; first >= 0 && j < ${#uris[@]}; j++ )); do
    kill "${probe_pid[$i.$j]}" 2> /dev/null
  done
  if (( first < 0 )); then
    log "$name: no source answered the probe, keeping ${uris[0]} first"
  elif (( first > 0 )); then
    log "$name: ${uris[0]} failed the probe, trying ${uris[$first]} first"
  else
    log "$name: ${uris[0]} first"
  fi
  tmp=$(mktemp "$list.XXXXXX") || continue
  next=2
  j=0
  while IFS= read -r line; do
    if [[ -z ${line//[[:space:]]/} || $line == \#* ]]; then
      printf '%s\n' "$line"
      continue
    fi
    if (( j == first || (first < 0 && j == 0) )); then
      priority=1
    else
      priority=$next
      next=$((next + 1))
    fi
    printf '%s\tpriority:%d\n' "${uris[$j]}" "$priority"
    j=$((j + 1))
  done < "$list" > "$tmp"
  if ! { chmod 644 "$tmp" && mv -f "$tmp" "$list"; }; then
    rm -f "$tmp"
  fi
done
wait
exit 0
