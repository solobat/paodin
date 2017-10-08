#!/bin/sh

# prepare
echo "准备目录......"
rm -fr output
mkdir -p output

# build
echo "编译中....."
npm run build:minified || { echo "编译失败，请检查后重试"; exit 1; }

zip -r wordcard-ext.zip output/

echo "打包完毕"

mv -f wordcard-ext.zip ~/Desktop

echo "移动到桌面"