module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        '@vue/standard'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'key-spacing': ['error'],
        'keyword-spacing': ['error'],
        'standard/no-callback-literal': 0,
        'handle-callback-err': 0,
        'no-return-assign': 0,
        'eqeqeq': 0,
        'comma-dangle': 0,
        'semi': 0,
        'space-before-function-paren': 0,
        'keyword-spacing': 0,
        'no-useless-escape': 0,
        'no-invalid-this': 0,
        'operator-linebreak': 0,
        'indent': [
            'error',
            4,
            {
                'SwitchCase': 1
            }
        ],
        'no-const-assign': 'warn',
        'no-this-before-super': 'warn',
        'no-undef': 2,
        'no-unreachable': 'warn',
        'no-unused-vars': 'warn',
        'constructor-super': 'warn',
        'valid-typeof': 'warn',
        'one-var': 'warn',
        'max-len': 'off',
        'no-trailing-spaces': 'off',
        'require-jsdoc': 'warn',
        'camelcase': 'warn',
        'no-invalid-this': 'warn',
        'linebreak-style': 0,
        'vue/no-parsing-error': [2, {
            'x-invalid-end-tag': false,
            'invalid-first-character-of-tag-name': false
        }],
        'no-tabs': 0,
        'vue/html-indent': [2, 2, {
            'attribute': 1,
            'closeBracket': 0,
            'alignAttributesVertically': false
        }],
        'vue/require-default-prop': 0,
        'vue/component-name-in-template-casing': 0,
        'vue/html-closing-bracket-spacing': 0,
        'vue/html-closing-bracket-newline': 0,
        'vue/singleline-html-element-content-newline': 0,
        'vue/multiline-html-element-content-newline': 0,
        'vue/attributes-order': 0,
        'vue/html-self-closing': 0
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
