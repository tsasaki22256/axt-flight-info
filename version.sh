#!/bin/sh

mkdir assets/js
ver=`git tag | sort -V | tail -1`
d=`date +%Y%m%d`
echo "export const versionInfo = { version: '$ver', releaseDate: '$d', };" > assets/js/version.js
