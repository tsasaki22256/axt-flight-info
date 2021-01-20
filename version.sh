#!/bin/sh

mkdir assets/js
ver=`git tag | sort -V | tail -1`
echo "export const versionInfo = { version: '$ver', };" > assets/js/version.js
