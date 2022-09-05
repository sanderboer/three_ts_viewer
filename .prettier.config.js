// prettier.config.js or .prettierrc.js
module.exports =
  {
    printWidth : 120,
	  trailingComma: "es5",
	  tabWidth: 4,
    tabs : false, //use spaces, not tabs
	  semi: true, 
	  singleQuote: false, // single quotes are too easily confused with ticks.
    bracketSpacing: true, // Print spaces between brackets in object literals.
    arrowFunctionParentheses: "always", // Include parentheses around a sole arrow function parameter.
    proseWrap: "preserve", // do not format prose
    endOfLine: "crlf", //Carriage Return + Line Feed characters (\r\n), common on Windows
}
