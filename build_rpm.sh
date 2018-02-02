#!/bin/bash

VERSION="$version" # fix for build environment

TEMP=temp/srv/www/ssldocs

mkdir -p $TEMP

cp -rp ssldocs/* $TEMP

# Making configuration files
cp config.spec.tpl config.spec

FILES=$(ls -f $(find $TEMP -type f -o -type l) | sed 's/^.*/\/&/' | sed 's/\/temp//')

for f in $FILES; do
    echo $f >> config.spec
done

rpmbuild -bb --define "version $VERSION" --buildroot ${PWD}/temp config.spec

# Cleaning
rm -rf temp config.spec

# Getting artifacts
cp /usr/src/packages/RPMS/i586/azimuth-html5-player-${VERSION}-1.i586.rpm .
