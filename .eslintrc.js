module.exports = {
  'env': {
    'es6': true,
    'node': true,
    'browser': true
  },
  'extends': [
    'eslint:recommended',
    'google'
  ],
  'globals': {
    'require': true,
  },
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
      'objectLiteralShorthandMethods': true
    }
  },
  'plugins': [
    'react'
  ],
  'react/jsx-uses-react': 1,
  'rules': {
    'indent': [2, 2]
  }
};
