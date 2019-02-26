module.exports = {
    "extends": "airbnb",
    "rules": {
      "react/jsx-filename-extension": 0,
      "react/prefer-stateless-function": "off",
      "NAME ERROR": 0,
      'max-len': ["error", { "code": 200 }],
      "react/prop-types": 'off'
     },
    "env": {
      "browser": true
    },
    "plugins": ["react"],
    "parserOptions": {
      "sourceType": "module"
  }
};