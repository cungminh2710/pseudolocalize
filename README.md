# Pseudolocalize

Several implementation of pseudolocalizing ICU strings, ported from @formatjs/cli

Available pseudo-locales:

Given the English message `my name is {name}`

| Locale  | Message                                      |
| ------- | -------------------------------------------- |
| `en-XA` | `ṁẏ ńâṁè íś {name}`                          |
| `en-XB` | `[!! ṁẏ ńâṁṁṁè íííś  !!]Minh`                |
| `en-XC` | `မြ···ṁẏ ńâṁè íś Minh···မြ`                   |