Unicorn.js builds
=================

After building Unicorn.js, this directory should contain the complete library in:

* `unicorn.min.js`

and specialized libraries for each of the available architectures:

* `unicorn-aarch64.min.js`
* `unicorn-arm.min.js`
* `unicorn-m68k.min.js`
* `unicorn-mips.min.js`
* `unicorn-sparc.min.js`
* `unicorn-x86.min.js`

The `.gitignore` file at the root of this repository tracks only few of these and ignores the rest. This was made to avoid unnecessarily bloating the repository with files not actually needed for the demos.

If you are looking for these missing pre-compiled versions, take a look at the [releases](https://github.com/AlexAltea/unicorn.js/releases) page.
