let TwoLetterBem = null

describe('TwoLetterBem', () => {
  beforeEach(() => {
    TwoLetterBem = require('../')
  })
  it('should die when no cssPath is present', () => {
    const mockExit = jest.spyOn(process, 'exit').
      mockImplementation((code) => code)

    console.error = jest.fn()

    new TwoLetterBem()

    expect(mockExit).toHaveBeenCalledWith(1)

    mockExit.mockRestore()

    console.error.mockRestore()
  })

  it('should correctly merge properties', () => {
    const userArgs = { i: 'hello there' }
    const instance = new TwoLetterBem(userArgs)
    expect(instance.config.cssPath).toBe('hello there')
  })

  it('should should merge all userArgs', () => {
    const userArgs = {
      i: 'a',
      s: 'b',
      o: 'c',
      j: 'd',
      pa: 'e',
      pl: 'f',
      w: 'g',
    }
    const packageArgs = {
      config: {
        twoLetterBem: {
          jsonSpace: 1,
          permutationLetters: 'abc',
        },
      },
    }
    const instance = new TwoLetterBem(userArgs, packageArgs)
    expect(instance.config).toMatchObject({
      cssPath: 'a',
      jsonSpace: 1,
      outputCssPath: 'c',
      outputJsonPath: 'd',
      permutationArgs: 'e',
      permutationLetters: 'abc',
      whiteList: 'g',
    })
  })
})

describe('TwoLetterBem test methods', () => {
  let instance
  beforeEach(() => {
    TwoLetterBem = require('../')
    instance = new TwoLetterBem({
      i: './index.css',
      s: 0,
      o: 'c',
      j: './temp.json',
      pl: 'ab',
      w: 'g',
    })
    instance.setPermutationLetters()
    instance.cssContents =
      '*>.foo+.bar > .baz.q__u--x{}@media screen {.quux{}}'
  })

  it('should retrieve all the permutations', () => {
    expect(instance.letters).toMatchObject(['a', 'b', 'aa', 'ab', 'ba', 'bb'])
  })

  it('should set contents of the json file', () => {
    instance.setHashMap()
    expect(instance.rules).toEqual({
      '.foo': '.a',
      '.bar': '.b',
      '.baz': '.aa',
      '.q__u--x': '.ab',
      '.quux': '.ba',
    })
    expect(JSON.parse(instance.getJson())).toEqual({
      foo: 'a',
      bar: 'b',
      baz: 'aa',
      'q__u--x': 'ab',
      quux: 'ba',
    })
  })

  it('should set contents of the css file', () => {
    instance.setHashMap()
    expect(instance.getCss()).toBe('*>.a+.b > .aa.ab{}@media screen {.ba{}}')
  })
})

describe('TwoLetter css file interactions', () => {
  let instance
  beforeEach(() => {
    TwoLetterBem = require('../')
    instance = new TwoLetterBem({
      i: './tests/index.css',
      o: './tests/out.css',
      j: './tests/out.json',
      w: ['.whiteList'],
    })
  })

  it('should correctly format a css file', () => {
    instance.init()
    expect(instance.getCss()).toMatchSnapshot()
  })
  it('should preserve whitelisted css names', ()=> {
    instance.init()
    expect(instance.getCss().includes('.whiteList')).toBe(true)
  })
})
