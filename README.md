# eslint-plugin-knex

[![npm version](https://badge.fury.io/js/eslint-plugin-knex.svg)](https://badge.fury.io/js/eslint-plugin-knex)

## Installation

```
npm install -D @exodus/eslint-plugin-knex
yarn add -D @exodus/eslint-plugin-knex
```

## Usage

In your eslint config file:

```
{
  "plugins": ["@exodus/eslint-plugin-knex"],
  "rules": {
    "@exodus/knex/avoid-injections": "error"
  }
}
```

## Settings

You can configure what names you intend to use for the knex client. Make sure to
include the library itself (`knex`), but also transaction variables (`trx`,
`transaction`).

```
{
  "settings": {
    "knex": {
      "builderName": "^(knex|transaction)$",
      "rawStatements": "/^(raw|whereRaw|joinRaw|wrapQuery)$/",
    }
  }
}
```

## Rules

### `knex/avoid-injections`

Avoid some issues related to SQL injection by disallowing plain strings as the query argument to the raw queries. Check out [the tests](https://github.com/AntonNiklasson/eslint-plugin-knex/blob/master/rules/avoid-injections.test.js) to get a sense for what is valid and not.
