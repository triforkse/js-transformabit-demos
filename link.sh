#!/bin/sh

rm -rf node_modules/js-transformabit
npm link js-transformabit
cd .atomist
rm -rf node_modules/js-transformabit
npm link js-transformabit
