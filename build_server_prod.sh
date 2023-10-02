#!/bin/bash
set -e

# Build the svelte static files.
rm -rf web/blueprint/build
npm run build

rm -rf lilac/web && mkdir -p lilac/web
cp -R web/blueprint/build/* lilac/web/
