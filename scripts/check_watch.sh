#!/usr/bin/env bash
# Compiles the watch app with the DevEco lite compiler (same as the Previewer)
# and shows only warnings and errors. Usage: bash scripts/check_watch.sh
ACE="${ACE_LOADER:-/d/DevEco Studio/sdk/default/openharmony/js/build-tools/ace-loader}"
NODE="${DEVECO_NODE:-/d/DevEco Studio/tools/node/node.exe}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
W="$(cygpath -w "$ROOT/watch")"
OUT="$(cygpath -w "${TMPDIR:-/tmp}")"
cd "$ACE" || exit 1
aceModuleRoot="$W\entry\src\main\js\MainAbility" \
aceModuleBuild="$OUT\jjas_litebuild" cachePath="$OUT\jjas_litecache" \
aceManifestPath="$W\entry\.preview\default\intermediates\manifest\default\MainAbility\manifest.json" \
aceBuildJson="$W\entry\.preview\default\intermediates\loader\default\MainAbility\loader.json" \
projectProfilePath="$W\build-profile.json5" \
appResource="$W\entry\.preview\default\intermediates\res\default\ResourceTable.txt" \
watchMode=false img2bin=false hapMode=false \
"$NODE" node_modules/webpack/bin/webpack.js --config webpack.lite.config.js 2>&1 \
  | sed 's/\x1b\[[0-9;]*m//g' | grep -A1 -E "WARNING|ERROR|COMPILE RESULT" | grep -v "^--$"
