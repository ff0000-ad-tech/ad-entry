##### 160over90 - Ad Technology

# Ad-Entry

Our ad framework gets compiled in two separate webpack bundles:

1. Initial - `index.html` JS boilerplate inlined into the index.
2. Build - `build.bundle.js` JSX ad creative, politely loaded by the index.

This package is the "initial"-bundle's entry point.

While the `index.html` is the true "entry point" for our ads, this package is the beginning of the compiled ESM dependencies. This entry gets bundled by [wp-deploy-manager](https://github.com/ff0000-ad-tech/wp-deploy-manager/blob/master/webpack-config.js) and inlined into the index by [wp-plugin-index](https://github.com/ff0000-ad-tech/wp-plugin-index).
