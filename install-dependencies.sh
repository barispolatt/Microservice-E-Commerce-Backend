#!/bin/bash
# This script installs dependencies for all services and the shared library.

set -e # Exit immediately if a command exits with a non-zero status.

echo "--- Installing root dependencies for shared library ---"
(cd libs && npm install)

# Find all package.json files within service directories and run npm install
find . -name "package.json" -not -path "./libs/*" -not -path "./node_modules/*" | while read -r fname; do
    dir=$(dirname "${fname}")
    echo ""
    echo "--- Installing dependencies for ${dir} ---"
    (cd "${dir}" && npm install)
done

echo ""
echo "✅ All dependencies installed successfully!"