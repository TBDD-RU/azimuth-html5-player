#!/bin/bash

VERSION="$version" # fix for build environment

echo -e "rendering index.html\n"

./include_all

echo -e "\npreparing electron-linux64\n"

mkdir electron-linux64

cd electron-linux64

curl -o electron.zip http://192.168.24.200/build-src/electron-v1.8.2-linux-x64.zip

echo

unzip electron.zip

cd ..

cp -r ssldocs electron-linux64/
cp electron-package.json electron-linux64/package.json
cp index.js electron-linux64/

echo -e "\npreparing nwjs-linux64\n"

curl -o nwjs.tgz http://192.168.24.200/build-src/nwjs-sdk-v0.28.2-linux-x64.tar.gz

tar xfzv nwjs.tgz

cp -r ssldocs nwjs-sdk-v0.28.2-linux-x64/
cp nwjs-package.json nwjs-sdk-v0.28.2-linux-x64/package.json

echo -e "\nbuilding..."

tar cfjv azimuth-player-electron-linux64.tbz electron-linux64
tar cfjv azimuth-player-nwjs-linux64.tbz nwjs-sdk-v0.28.2-linux-x64
