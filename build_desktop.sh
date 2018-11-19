#!/bin/bash

VERSION="$version" # fix for build environment

echo -e "rendering index.html...\n"

./include_all

echo -e "\nincluding submodules..."

git submodule update --init --recursive --remote

mkdir ssldocs/images

mv feather-icons/feather* ssldocs/images/

echo -e "\npreparing resouces...\n"

rm -fr ssldocs/templates

cp -r -v ssldocs electron/

echo -e "\nbuilding...\n"

cd electron

yarn version --new-version $VERSION

yarn install

yarn run build

cd ..
