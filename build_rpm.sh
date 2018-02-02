#!/bin/bash

VERSION="$version" # fix for build environment

mkdir -p temp/srv/www/ssldocs

cp -rp ssldocs/* temp/srv/www/ssldocs

# Making configuration files
cp config.spec.tpl temp/config.spec

rpmbuild -bb --define "version $VERSION" --buildroot ${PWD}/temp config.spec

# Cleaning
rm -rf temp

# Getting artifacts
cp /usr/src/packages/RPMS/i586/azimuth-prepare-${VERSION}-1.i586.rpm .
