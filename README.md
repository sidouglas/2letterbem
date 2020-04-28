# 2 Letter Bem

Compresses your css classes down to a few characters ( probably 2 ), which you can then use in your html via the json 
file.

##### Compressing css this way + gzip = *negligible results*
Example - bootstrap 4.4.1 css minified and gzipped:
* bootstrap.min.css.gz -> 23.6KB
* 2 letter bem version -> 22.8KB
* However, this can be used with html, to shave a kilobyte or two. 
This could be used to obfuscate your work.

input css file:
```
.something { ... }
.something__block { ... }
.something__block:hover .that-thing { ... }
.js-action-state something__block.active { ... }
```
output - creates 2 files
css: 
```
.a { ... }
.b { ... }
.b:hover.c { ... }
.js-action-state b.d { ... }
```
json:
```
{
"something": "a",
"something__block": "b",
"that-thing": "c",
"active" "d"
}
```
Anything prepended with .js in your css is not shortened.
You can specify a `whiteList` of classes that you don't want to be shortened. They won't appear in the json file either. 
You can use the json file as dictionary now for your html. 

Simple example in PHP:
```
function klass($cssName){
    $output = [];
    $cssNames = explode(' ', $cssInput);
    foreach ($cssNames as $cssName) {
      if (array_key_exists($cssName, $allYourClassNamesReadFromJSON)) {
        $output[] = $allYourClassNamesReadFromJSON[$cssName];
      } else {
        $output[] = $cssName;
      }
    }
    return implode(' ', $output);
}
<div class="klass('something')"></div> renders as <div class="a"></div>
```

### How to use

In package.json as an example:
```
{
...
 "config": {
    "2letterbem": {
      "whiteList": [
        ".is-active",
        ".wf-inactive",
      ]
    }
  },
  dependencies: { ... }
  devDependencies: { ... }
  scripts: {
   "2letterbem": "node ./node_modules/2letterbem/2letterbem.js --i ./inputFile.css --o ./outputFile.css --j ./jsonMapFile.json"
  }
...
```
or everything in package.json config
```
{
  ...
  "config": {
    "2letterbem": {
      "cssPath": "./inputFile.css", //required
      "jsonSpace": 2, //default is 2
      "outputCssPath": "./twoletterbem.css", //default
      "outputJsonPath": "./twoletterbem.json", //default
      "permutationArgs": {
        "maxSize": 2, // default you probably don't more than this 
        "recursive": true // creates both single and two letter characters
      },
      "permutationLetters": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", // the list of characters to generate from
      "whiteList": [ 
        //these won't be shortened
        ".is-active", 
        ".wf-inactive"
      ]
    }
  },
  scripts: {
    "2letterbem": "node ./node_modules/2letterbem/2letterbem.js"
  },
  ...
}
```

