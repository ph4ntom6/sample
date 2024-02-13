# BillTracker Software

This post will outline how to set up your local dev environment for bill tracker and will be updated regularly.

## Requirements

> **Note:** We need to make sure we have the following versions installed at the minimum

-   Node: 18
-   NPM: 9

The following commands can be used in the terminal to check your current versions

```
node --version
npm --version
```

If your versions of Node and/or NPM are incorrect, please refer to the "Steps to switch between Node & NPM versions" section further down in this post.

## Initial setup

Once you have the correct versions of Node & NPM running, clone the git repository using the following command

```
git clone git@github.com:Cygnis-Media/bill-tracker-api.git
```

Checkout the specific branch you want to run

```
git checkout dev # we will checkout dev branch in our example
```

Run the following commands to install the dependencies

```
npm install
```

Create a copy of the `.env.example` file and name it `.env`. Then, modify the following items in the `.env` file with your own corresponding values:

Next, use your preferred method of accessing your local MySQL installation (there are many MySQL GUI clients available for Windows, Mac and Linux) as the root user, and create a new database called `billtracker`. If you used a different name in your `.env` file, please use that name here. They must match.

Create a dedicated "data" folder within the "scripts" directory.

Download the recently updated yearly .zip file from https://downloads.leginfo.legislature.ca.gov/
i-e "pubinfo_yyyy.zip" and unzip it

Copy your data files to the newly created "data" folder i.e. ".dat" and ".lob" files.

Run the following commands to migrate database

```
npm run migrate-script-dev
```

```
npm run migrate
```

Run the following commands to seed database

```
npm run seed-script-dev
```

```
npm run seed
```

To start the server locally, run the following command

```
npm run dev
```

## Automated testing

## Steps to switch between Node & NPM versions

If you need to keep an old version of Node and NPM for other projects, you can install NVM (follow the link below)
https://www.sitepoint.com/quick-tip-multiple-versions-node-nvm/

Node versions link:
https://nodejs.org/en/about/releases/

If you have multiple versions of Node installed, and want to switch between them, use the following steps (if you are using Homebrew).

```
node --version # checking the node version, if it is 18+ we can ignore the following steps
brew unlink node # unlink existing node version
brew link node@18 # link node version 18 and check the version again
```

To upgrade npm version to the latest available version

```
npm --version # check the npm version
npm i -g npm # install npm globally
```

## Python Setup

# Inputs

# Outputs

-   Correction steps and recommendations to solve problems / causes

## Installation

This project is being built on python version '3.11.5'. Therefore, make sure to use this version. Additionally, all necessary pacakges are being listed in requirements.txt file. Use the following command to install:

> pip install -r requirements.txt
