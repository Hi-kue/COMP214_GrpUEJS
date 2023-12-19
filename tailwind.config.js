/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    './views/**/*.ejs',
    './views/*.ejs',
    './public/**/*.js', 
    './server/routes/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addVariant, e, postcss}) {
        addVariant('firefox', ({ container, seperator}) => {
          const isFirefoxRule = postcss.atRule({
            name: '-moz-document',
            params: 'url-prefix()',
          });
          isFirefoxRule.append(container.nodes);
          container.append(isFirefoxRule);
          isFirefoxRule.walkRules((rule) => {
            rule.selector = `.${e(`firefox${seperator}${rule.selector.slice(1)}`)}`;
          });
        });
    }),
  ],
}

