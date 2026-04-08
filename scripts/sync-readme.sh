#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

sync_file() {
  local filename="$1"
  local lang="$2"
  local src="$REPO_ROOT/$filename"
  local readme="$REPO_ROOT/README.md"
  local tmp="$REPO_ROOT/README.md.tmp"
  local begin="<!-- BEGIN:$filename -->"
  local end="<!-- END:$filename -->"

  # Build replacement: marker, fenced code block, content, closing fence
  {
    echo "$begin"
    echo "\`\`\`$lang"
    cat "$src"
    echo "\`\`\`"
  } > "$REPO_ROOT/.sync-block.tmp"

  # Use awk to skip lines between begin/end markers, inserting replacement block
  awk -v begin="$begin" -v end="$end" -v blockfile="$REPO_ROOT/.sync-block.tmp" '
    $0 == begin {
      while ((getline line < blockfile) > 0) print line
      close(blockfile)
      skip = 1
      next
    }
    $0 == end { print; skip = 0; next }
    skip { next }
    { print }
  ' "$readme" > "$tmp"

  mv "$tmp" "$readme"
  rm -f "$REPO_ROOT/.sync-block.tmp"
}

sync_file "package/dist/tw-utils.css" "css"
sync_file "package/dist/tw-merge-cfg.mjs" "js"
sync_file "package/dist/tw-plugin.mjs" "js"

echo "README synced."
