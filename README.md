Unicorn.js
==========
[![Last Release](https://img.shields.io/badge/version-0.9-brightgreen.svg?style=flat)](https://github.com/AlexAltea/unicorn.js/releases)

Port of the [Unicorn](https://github.com/unicorn-engine/unicorn) CPU emulator framework for JavaScript. Powered by [Emscripten](https://github.com/kripken/emscripten).

**Notes:** _Unicorn_ is a lightweight multi-architecture CPU emulator framework originally developed by Nguyen Anh Quynh et al. and released under GPLv2 license. More information about contributors and license terms can be found in the files `AUTHORS.TXT`, `CREDITS.TXT` and `COPYING` inside the *unicorn* submodule of this repository.

## Installation
To add Unicorn.js to your web application, include it with:
```html
<script src="keystone.min.js"></script>
```
or install it with the Bower command:
```bash
bower install keystonejs
```

## Usage                                                      
```javascript
// TODO
```

## Building
To build the Unicorn.js library, clone the *master* branch of this repository, and do the following:

1. Initialize the original Unicorn submodule: `git submodule update --init`.

2. Install the development and client dependencies with: `npm install` and `bower install`.

3. Install the latest [Python 2.x (64-bit)](https://www.python.org/downloads/), [CMake](http://www.cmake.org/download/) and the [Emscripten SDK](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html). Follow the respective instructions and make sure all environment variables are configured correctly. Under Windows [MinGW](http://www.mingw.org/) (specifically *mingw32-make*) is required.

4. Finally, build the source with: `grunt build`.
