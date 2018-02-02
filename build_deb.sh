#!/bin/bash

VERSION="$version" # fix for build environment

TMP_DIR=azimuth-html5-player_$VERSION-1_all

SRV_DIR=/srv/www/ssldocs

echo "Creating temporary directoty and copying files"

mkdir -p "$TMP_DIR$SRV_DIR"

cp -rp ssldocs/* "$TMP_DIR$SRV_DIR"

cp -rp DEBIAN $TMP_DIR

echo "Adding version to DEBIAN/control"
echo "Version: $VERSION" >> $TMP_DIR/DEBIAN/control

echo "Creating package"

fakeroot dpkg-deb --build $TMP_DIR

echo "Removing $TMP_DIR"

rm -rf $TMP_DIR
