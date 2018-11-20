#!/bin/sh

# prepare
echo "prepare fold......"
rm -fr output
mkdir -p output

# build
echo "comipling....."
npm run build || { echo "build failed, please check"; exit 1; }

zip -r wordcard-ext-ff.zip output/

echo "package done"

mv -f wordcard-ext-ff.zip ~/Desktop

echo "move to Desktop"