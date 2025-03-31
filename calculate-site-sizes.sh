#!/bin/bash

# Define the site directory
SITE_DIR="_site"
OUTPUT_FILE="_data/siteSize.json"

# Function to format numbers to always have two decimal places
format_number() {
  printf "%.2f" "$1"
}

# Get the total size of the _site directory in kilobytes with two decimal places
TOTAL_SIZE=$(du -sk "$SITE_DIR" | awk '{print $1}')
TOTAL_SIZE_KB=$(format_number "$(echo "scale=2; $TOTAL_SIZE / 1" | bc)")

# Start building the JSON object for the site size data
echo "{" > $OUTPUT_FILE
echo "  \"totalSize\": $TOTAL_SIZE_KB," >> $OUTPUT_FILE
echo "  \"pageSizes\": {" >> $OUTPUT_FILE

# Loop through all HTML files in the _site directory
find "$SITE_DIR" -type f -name "*.html" | while read -r file; do
  echo "Processing file: $file"

  # Get the file size in kilobytes
  PAGE_SIZE_BYTES=$(stat -f %z "$file")
  PAGE_SIZE_KB=$(format_number "$(echo "scale=2; $PAGE_SIZE_BYTES / 1024" | bc)")

  # Get the directory where this file is located
  DIR=$(dirname "$file")

  # Ensure ASSET_SIZE_BYTES has a default value
  ASSET_SIZE_BYTES=$(find "$DIR" -mindepth 1 -type f ! -name "*.html" -exec stat -f %z {} + | awk '{sum+=$1} END {print sum}')
  ASSET_SIZE_BYTES=${ASSET_SIZE_BYTES:-0}  # Default to 0 if empty

  ASSET_SIZE_KB=$(format_number "$(echo "scale=2; $ASSET_SIZE_BYTES / 1024" | bc)")

  # Ensure non-empty values
  PAGE_SIZE_KB=${PAGE_SIZE_KB:-0.00}
  ASSET_SIZE_KB=${ASSET_SIZE_KB:-0.00}

  # Calculate total size for this page
  TOTAL_PAGE_SIZE_KB=$(format_number "$(echo "scale=2; $PAGE_SIZE_KB + $ASSET_SIZE_KB" | bc)")

  # Get relative path for JSON output
  RELATIVE_PATH=$(echo "$file" | sed "s|$SITE_DIR/||")

  # Debug output
  echo "  HTML Size: ${PAGE_SIZE_KB}KB, Asset Size: ${ASSET_SIZE_KB}KB, Total: ${TOTAL_PAGE_SIZE_KB}KB"

  # Write to JSON
  echo "    \"$RELATIVE_PATH\": $TOTAL_PAGE_SIZE_KB," >> $OUTPUT_FILE
done

# Remove the last comma to make valid JSON
sed -i '' '$ s/,$//' $OUTPUT_FILE

# Close the JSON structure
echo "  }" >> $OUTPUT_FILE
echo "}" >> $OUTPUT_FILE

echo "Site sizes have been written to $OUTPUT_FILE"