const _escapeRegExp = require('lodash/escapeRegExp')
const extract = require('css')
const extractClassFromString = require('string-extract-class-names')
const fs = require('fs')
const path = require('path')
const permutation = require('string-permutation')

module.exports = class TwoLetterBem {

  constructor (userArgs = {}, packageJsonFile = {}) {

    this.letters = null
    this.cssContents = null
    this.rules = []

    this.config = {
      cssPath: userArgs.i,
      jsonSpace: userArgs.s || 2,
      outputCssPath: userArgs.o || './twoletterbem.css',
      outputJsonPath: userArgs.j || './twoletterbem.json',
      permutationArgs: userArgs.pa || { maxSize: 2, recursive: true },
      permutationLetters: userArgs.pl ||
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      whiteList: userArgs.w || [],
    }

    if (packageJsonFile.config && packageJsonFile.config.twoLetterBem) {
      Object.entries(this.config).forEach(([key, value]) => {
        this.config[key] = packageJsonFile.config.twoLetterBem[key] || value
      })
    }

    if (!this.config.cssPath) {
      console.error('Specify css input in package scripts: -i ./yourfile.css\n')
      process.exit(1)
    }
  }

  init () {
    const { cssPath, outputCssPath, outputJsonPath } = this.config
    this.setPermutationLetters()
    this.cssContents = fs.readFileSync(cssPath, 'utf-8')
    this.setHashMap()

    this.writeFile(outputCssPath, this.getCss())
    this.writeFile(outputJsonPath, this.getJson())
  }

  extractRules (next, acc) {
    next.selectors.forEach((selector) => {
      selector.split(' ').forEach((classNameList) => {
        extractClassFromString(classNameList).forEach((className) => {
          if (className.startsWith('.')
            && !acc[className]
            && !this.config.whiteList.includes(className)
            && !className.startsWith('\.js')) {
            acc[className] = `.${this.letters.shift()}`
          }
        })
      })
    })

    return acc
  }

  getCss () {
    return Object.entries(this.rules).reduce((acc, [key, value]) => {
      acc = acc.replace(new RegExp((`${_escapeRegExp(key)}`), 'g'), value)
      return acc
    }, this.cssContents)
  }

  getJson () {
    const json = Object.entries(this.rules).reduce((acc, [k, v]) => {
      // remove the period from the key/values
      acc[k.slice(1)] = v.slice(1)
      return acc
    }, {})
    return JSON.stringify(json, null, this.config.jsonSpace)
  }

  setHashMap () {
    const ast = extract.parse(this.cssContents)
    this.rules = ast.stylesheet.rules.reduce((acc, next) => {
      if (next.type === 'rule') {
        acc = this.extractRules(next, acc)
      } else if (next.type === 'media') {
        next.rules.forEach((rule) => {
          acc = this.extractRules(rule, acc)
        })
      }
      return acc
    }, {})
  }

  setPermutationLetters () {
    const { permutationLetters, permutationArgs } = this.config
    this.letters = permutation(permutationLetters, permutationArgs)
  }

  writeFile (outputFile, contents) {
    return fs.writeFile(outputFile, contents, 'utf8', (error) => {
      const extension = path.extname(outputFile).slice(1)
      if (error) {
        console.log(`An error occurred while writing ${extension} to File.`)
      }
      console.log(`${extension} saved.`)
    })
  }
}
