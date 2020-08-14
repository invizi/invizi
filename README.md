# Invizi
[![Electron Linux](https://github.com/invizi/invizi/workflows/Electron%20Linux/badge.svg?branch=master)](https://github.com/invizi/invizi/releases/download/v1.0.0/Invizi-1.0.0.x86_64.rpm)
[![Electron Windows](https://github.com/invizi/invizi/workflows/Electron%20Windows/badge.svg)](https://github.com/invizi/invizi/releases/download/v1.0.0/Invizi.Setup.1.0.0.exe)
[![Electron MacOs](https://github.com/invizi/invizi/workflows/Electron%20MacOs/badge.svg)](https://github.com/invizi/invizi/releases/download/v1.0.0/Invizi-1.0.0.dmg)


Invizi is a 100% open source, private and free cryptocurrency manager.

With Invizi you can safely track and trade your digital assets - all your data is local, encrypted and never leaves your computer. Invizi is a public good and will always be free to use.

![invizi-dashboard](https://user-images.githubusercontent.com/67179784/88055712-b5c2de00-cb5f-11ea-947a-84d781459283.png)

Our mission is to empower people to manage their digital assets without compromising their privacy. We want to usher in a world without data breaches, predatory ad models, commoditization of user’s data and abuse of privacy. 

## How to build and run from source

### Prerequisites
- [Git](https://git-scm.com/) 
- [Node.JS](https://nodejs.org/en/) v12.x
- [NPM](https://www.npmjs.com/get-npm)
- A C/C++ compiler tool chain for your platform

### 1. Get the source
``` bash

git clone https://github.com/invizi/invizi.git
```
### 2. Build

``` bash
cd invizi

# install dependencies
npm install
```
#### Build for Mac
``` bash
npm run build:mac
```
#### Build for Windows
``` bash
npm run build:win
```
#### Build for Linux
``` bash
npm run build:linux
```
the executable will be placed in ./build folder
## Contributing
There are many ways in which you can contribute:

* [Submit bugs and feature requests](https://github.com/invizi/invizi/issues)
* Upvote [popular feature requests](https://github.com/invizi/invizi/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request+sort%3Areactions-%2B1-desc)
* Follow [@invizi_co](https://twitter.com/invizi_co) and tell us what you think



## License

Licensed under the [GPLv3](LICENSE.txt) license.
