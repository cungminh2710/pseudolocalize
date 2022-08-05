#!/bin/bash

set -euo pipefail

main() {
  echo "Removing node_modules"
  find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \;
  echo "Removing .next build"
  find . -name '.next' -type d -prune -print -exec rm -rf '{}' \;
  echo "Compress .git"
  git repack -a -d --depth=250 --window=250
}

main "$@"