#  (jsonc/sort-array-values)

> description

## :book: Rule Details

This rule reports ???.


<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/sort-array-values: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "foo",

    /* ✗ BAD */
    "BAD": "bar"
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

```json
{
  "jsonc/sort-array-values": ["error", {
   
  }]
}
```

Same as [sort-array-values] rule option. See [here](https://eslint.org/docs/rules/sort-array-values#options) for details.

- 

## :books: Further reading

- 

## :couple: Related rules

- [sort-array-values]

[sort-array-values]: https://eslint.org/docs/rules/sort-array-values

