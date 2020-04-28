const TwoLetterBem = require('./twoLetterBem');

const yargs = require('yargs').argv

const packageJson = require(`${process.env.PWD}/package.json`)

const instance = new TwoLetterBem(yargs, packageJson)

instance.init();
