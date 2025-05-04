#!/bin/bash

# This script builds the rtsim executable from the source code.
# It uses esbuild to bundle the JavaScript code and node-sea to create a standalone executable.
# Requirements: node, esbuild, postject

# Default values
foldername="./dist"
clean=0

# Parse arguments
arg1="$1"
arg2="$2"

# Show help
if [[ "$arg1" == "-h" || "$arg2" == "-h" ]]; then
  echo "RTsim Build Script"
  echo "Usage: ./build.sh [output_path] [-c | -h]"
  echo "-c: Clean up temporary files after build"
  echo "-h: Show this help message"
  exit 0
fi

# Handle clean flag
if [[ "$arg1" == "-c" || "$arg2" == "-c" ]]; then
  clean=1
  echo "Cleaning up temporary files after build enabled."
fi

# Handle output path
if [[ -n "$arg1" && "$arg1" != "-c" ]]; then
  foldername="$arg1"
  echo "Output path provided: $foldername"
else
  echo "No output path provided. Using default: $foldername"
fi

# Create output directory
mkdir -p "$foldername"
if [[ $? -ne 0 ]]; then
  echo "Failed to create directory $foldername. Please check permissions."
  exit 1
fi

# Create sea-config.json
echo "Creating SEA config..."
cat <<EOF > "$foldername/sea-config.json"
{ "main": "dist/bundle/index.cjs", "output": "$foldername/sea-prep.blob" }
EOF
if [[ $? -ne 0 ]]; then
  echo "Build failed. Cannot write to $foldername/sea-config.json."
  exit 1
fi

echo "Building rtsim..."
echo "Bundling with esbuild..."
npx esbuild main.js --bundle --outfile="$foldername/bundle/index.cjs" --platform=node
if [[ $? -ne 0 ]]; then
  echo "Build failed during esbuild."
  exit 1
fi

echo "Creating SEA blob..."
node --experimental-sea-config "$foldername/sea-config.json"
if [[ $? -ne 0 ]]; then
  echo "Node SEA blob creation failed."
  exit 1
fi

echo "Copying Node.js executable..."
cp "$(command -v node)" "$foldername/rtsim"
if [[ $? -ne 0 ]]; then
  echo "Executable copy failed."
  exit 1
fi

echo "Injecting SEA blob [signature warning expected]..."
npx postject "$foldername/rtsim" NODE_SEA_BLOB "$foldername/sea-prep.blob" \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
if [[ $? -ne 0 ]]; then
  echo "Executable injection failed."
  exit 1
fi

echo "Executable created at: $foldername/rtsim"

if [[ "$clean" == "1" ]]; then
  echo "Cleaning up temporary files..."
  rm -rf "$foldername/bundle"
  rm -f "$foldername/sea-prep.blob"
  rm -f "$foldername/sea-config.json"
fi
