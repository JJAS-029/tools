#!/usr/bin/env bash
# Switches the watch app between the personal version and the public (AppGallery) one.
# Usage: bash scripts/set_flavor.sh public|personal
set -e
F="$(cd "$(dirname "$0")/.." && pwd)/watch/entry/src/main/js/MainAbility/common/flavor.js"
case "$1" in
  public)   sed -i 's/export const PUBLIC = .*;/export const PUBLIC = true;/' "$F" ;;
  personal) sed -i 's/export const PUBLIC = .*;/export const PUBLIC = false;/' "$F" ;;
  *) echo "uso: $0 public|personal"; exit 1 ;;
esac
grep "export const PUBLIC" "$F"
