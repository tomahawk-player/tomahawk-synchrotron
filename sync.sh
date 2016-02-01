#!/bin/bash

set -e -x

for i in $( ls resolvers/ ); do
    if [[ "$i" == "spotify-linux-x64" || "$i" == "spotify-linux-x86" || "$i" == "spotify-osx" || "$i" == "spotify-win" ]]; then
        continue;
    fi

    cp -Rvf $1/$i/* resolvers/$i/
done
