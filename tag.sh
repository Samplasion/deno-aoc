#!/bin/bash

if [ -z "$1" ]; then
  echo "No tag provided."
  exit 1
fi

cat > ./version.ts <<- EOM
/* Auto-generated file. Do not edit by hand. */
export const VERSION = '$1';
EOM

git add ./version.ts
git commit -m "Update to version v$1"
git tag "$1"