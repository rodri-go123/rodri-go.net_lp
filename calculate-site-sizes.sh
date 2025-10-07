#!/bin/bash

SITE_DIR="_site"
OUTPUT_FILE="_data/siteSize.json"

# Format numbers to two decimal places
format_number() {
  printf "%.2f" "$1"
}

# Total site size excluding PDFs (in KB)
TOTAL_SIZE=$(find "$SITE_DIR" -type f ! -name "*.pdf" -exec du -sk {} + | awk '{sum+=$1} END {print sum}')
TOTAL_SIZE_KB=$(format_number "$(echo "scale=2; $TOTAL_SIZE / 1" | bc)")

# Aggregators for project pages
PROJECT_TOTAL_SIZE_KB=0
PROJECT_PAGE_COUNT=0

# Start JSON
echo "{" > "$OUTPUT_FILE"
echo "  \"totalSize\": $TOTAL_SIZE_KB," >> "$OUTPUT_FILE"
echo "  \"pageSizes\": {" >> "$OUTPUT_FILE"

# Use process substitution so the while loop runs in the current shell (no subshell)
while read -r file; do
  echo "Processing file: $file"

  PAGE_SIZE_BYTES=$(stat -f %z "$file")
  PAGE_SIZE_KB=$(format_number "$(echo "scale=4; $PAGE_SIZE_BYTES / 1024" | bc)")

  DIR=$(dirname "$file")

  # Sum non-HTML, non-PDF assets in the same directory
  ASSET_SIZE_BYTES=$(find "$DIR" -mindepth 1 -type f ! -name "*.html" ! -name "*.pdf" -exec stat -f %z {} + | awk '{sum+=$1} END {print sum}')
  ASSET_SIZE_BYTES=${ASSET_SIZE_BYTES:-0}

  ASSET_SIZE_KB=$(format_number "$(echo "scale=4; $ASSET_SIZE_BYTES / 1024" | bc)")

  PAGE_SIZE_KB=${PAGE_SIZE_KB:-0.00}
  ASSET_SIZE_KB=${ASSET_SIZE_KB:-0.00}

  # Total page size (HTML + same-dir assets)
  TOTAL_PAGE_SIZE_KB=$(format_number "$(echo "scale=4; $PAGE_SIZE_KB + $ASSET_SIZE_KB" | bc)")

  # Relative path for JSON
  RELATIVE_PATH=$(echo "$file" | sed "s|$SITE_DIR/||")

  echo "  HTML Size: ${PAGE_SIZE_KB}KB, Asset Size: ${ASSET_SIZE_KB}KB, Total: ${TOTAL_PAGE_SIZE_KB}KB"
  echo "    \"$RELATIVE_PATH\": $TOTAL_PAGE_SIZE_KB," >> "$OUTPUT_FILE"

  # Track only pages matching projects/YYYY_project_name/index.html
  if [[ "$RELATIVE_PATH" =~ ^projects/[0-9]{4}_[^/]+/index\.html$ ]]; then
    # Keep PROJECT_TOTAL_SIZE_KB as a numeric string for bc
    PROJECT_TOTAL_SIZE_KB=$(echo "$PROJECT_TOTAL_SIZE_KB + $TOTAL_PAGE_SIZE_KB" | bc)
    PROJECT_PAGE_COUNT=$((PROJECT_PAGE_COUNT + 1))
  fi

done < <(find "$SITE_DIR" -type f -name "*.html")

# Remove trailing comma and close pageSizes
# NOTE: macOS sed syntax; if on Linux change to `sed -i '$ s/,$//' "$OUTPUT_FILE"`
sed -i '' '$ s/,$//' "$OUTPUT_FILE"
echo "  }," >> "$OUTPUT_FILE"

# Compute average project page size
if [ "$PROJECT_PAGE_COUNT" -gt 0 ]; then
  AVERAGE_PROJECT_SIZE_KB=$(format_number "$(echo "scale=6; $PROJECT_TOTAL_SIZE_KB / $PROJECT_PAGE_COUNT" | bc)")
else
  AVERAGE_PROJECT_SIZE_KB="0.00"
fi

echo "  \"averageProjectPageSize\": $AVERAGE_PROJECT_SIZE_KB" >> "$OUTPUT_FILE"
echo "}" >> "$OUTPUT_FILE"

echo "Site sizes have been written to $OUTPUT_FILE"
echo "Average project page size: ${AVERAGE_PROJECT_SIZE_KB}KB ($PROJECT_PAGE_COUNT project pages total)"
