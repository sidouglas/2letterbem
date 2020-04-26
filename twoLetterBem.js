const _escapeRegExp = require('lodash/escapeRegExp')
const extract = require('css')
const fs = require('fs')
const path = require('path')
const permutation = require('string-permutation')

module.exports = class TwoLetterBem {

  constructor (userArgs, packageJsonFile) {
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

    this.letters = null
    this.cssContents = null
    this.rules = []

    this.init()
  }

  init () {
    this.setPermutationLetters()
    this.cssContents = fs.readFileSync(this.config.cssPath, 'utf-8')
    this.setHashMap()

    this.writeFile(this.config.outputCssPath, this.getCss())
    this.writeFile(this.config.outputJsonPath, this.getJson())
  }

  extractRules (next, acc) {
    next.selectors.forEach((selector) => {
      selector.split(' ').forEach((className) => {
        const match = className.match(/\.-?[\w-]+[_a-zA-Z0-9-]/)
        if (match
          && match[0]
          // don't add a duplicate class
          && !acc[match[0]]
          // don't include a whitelisted class name
          && !this.config.whiteList.includes(match[0])
          // don't add js prefixed class names
          && !match[0].startsWith('\.js')
        ) {
          //.originalClass: .compressedClassName
          acc[match[0]] = `.${this.letters.shift()}`
        }
      })
    })
    return acc
  }

  getCss () {
    return Object.entries(this.rules).reduce((acc, [k, value]) => {
      const key = `${_escapeRegExp(k)}(?=[{\\s\\.\\,:>~])`

      acc = acc.replace(new RegExp((key), 'g'), value)
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
    fs.writeFile(outputFile, contents, 'utf8', (error) => {
      const extension = path.extname(outputFile).slice(1)
      if (error) {
        console.log(`An error occurred while writing ${extension} to File.`)
      }
      console.log(`${extension} saved.`)
    })
  }
}
