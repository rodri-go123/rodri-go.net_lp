#!/bin/bash

# Find all images in projects/*/assets/ and process them
find projects -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img; do
    # Determine output path: projects/.../assets/_processed/filename.png
    dir=$(dirname "$img")
    filename=$(basename "$img" | sed 's/\.[^.]*$/.png/')  # Change extension to .png
    output_dir="$dir/_processed"
    output_path="$output_dir/$filename"

    # Create _processed directory if it doesn't exist
    mkdir -p "$output_dir"

    echo "Compressing: $img -> $output_path"

    # Convert image to PNG8 with dithering
    convert "$img" -resize 50% -colors 16 -ordered-dither o4x4,8 -interpolate Nearest -filter point PNG8:"$output_path"
done

echo "✅ Compression complete! Images saved in '_processed' subfolders."
