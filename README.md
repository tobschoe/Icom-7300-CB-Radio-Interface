# Welcome to the Icom-7300-CB-Radio-Interface wiki!
![IMG](https://i.imgur.com/F7VfooB.jpg)

## About:
This is a hobby project i am making to gain knowledge of 
serial communication.
### Usage
To use your Icom ic7300 as a CB radio

## Requirements:
-Pc running preferably Linux (was made for Raspberry Pi Model b+)

-Node.js

-Icom transceiver (tested with ic7300)

## ________Usage________
### Icom transciever preperation
1. Menu -> Set -> Connectors ->

-USB Serial Function: CI-V

2. Menu -> Set -> Connectors -> CI-V ->

-Baud Rate: default is 9600

-CI-V Address: default is 94h

-CI-V Transceive:ON

-CI-V USB->REMOTE Transceive Address: default is 94h

-CI-V Output(for ANT): OFF

-CI-V USB PORT: Unlink from Remote

-CI-V Baud Rate: default is 9600

-CI-V USB Echo back: OFF

### Pc Setup
1. Unzip File

2. Open terminal and change directory to unzipped folder

3. (optional) Edit config file in ./config/config.js

4. execute: node main.js

5. open browser of choise and enter " localhost:3005 "  //  3005 is the default port for the web server. can be changed in the config