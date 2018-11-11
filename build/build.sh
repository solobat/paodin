#!/bin/sh

# prepare
echo "prepare fold......"
rm -fr output
mkdir -p output

# build
echo "comipling....."
npm run build:minified || { echo "build failed, please check"; exit 1; }

zip -r wordcard-ext.zip output/

echo "package done"

mv -f wordcard-ext.zip ~/Desktop

echo "move to Desktop"