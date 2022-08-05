# Pseudolocalize

![NPM](https://img.shields.io/npm/dw/@cungminh2710/pseudolocalize) [![Node.js CI](https://github.com/cungminh2710/pseudolocalize/actions/workflows/node.js.yml/badge.svg)](https://github.com/cungminh2710/pseudolocalize/actions/workflows/node.js.yml)

Pseudolocalization is the process of using mock translations to aid in the testing of UI adaption and responsiveness to localized text.

This package contains several implementations of pseudolocalizing ICU strings. Some implementations are ported from @formatjs/cli

There are three techniques to pseudolocalize text:

- Accents (for example, “Lōrêm ípsüm”): Applies accents and diacritics to some characters. Not only does this help engineers clearly identify when text is pseudolocalized, it can also help identify issues with non-latin characters, character height and vertical space, and unsupported characters.

- Encapsulation (for example, “[Lorem ipsum]”): Clearly identifies the start and end of text. This helps detect cases where text is being concatenated, truncated, or where text has been hard-coded.

- Expansion (for example, “Loongeeer iiiipsuuum”): Simulates the expansion of text as it might appear in a translation. Shorter strings can expand by as much as 300%, with longer strings generally sitting somewhere between 150% and 250%. For more information, see [the IBM/W3 guidelines](https://www.w3.org/International/articles/article-text-size/#predict).

Read more on my [Canva Engineering blog about how to localize at scale](https://canvatechblog.com/how-to-design-in-every-language-at-once-f2dd66a2780f)

## Available pseudo-locales

- `en-XA` is ported from @formatjs/cli to test with accents technique.
- `en-XB` is ported from @formatjs/cli to test with encapsulation technique.
- `en-XC` is implemented using all three techniques: accents, encapsulation and expansion.
- `en-XD` is similar to `en-XC` and friendlier to dyslexic engineers.

Given the English message `my name is {name}`

| Locale  | Message                           |
| ------- | --------------------------------- |
| `en-XA` | `ṁẏ ńâṁè íś {name}`               |
| `en-XB` | `[!! ṁẏ ńâṁṁṁè íííś !!]Minh`      |
| `en-XC` | `မြ······ṁẏ ńâṁè íś Minh······မြ` |
| `en-XD` | `မြ······mẏ nâmè ís Minh······မြ` |

- As of 1 June 2022, on NPM, `code` component in this table above will fail for this tall burmese character `မြ`

![image](https://user-images.githubusercontent.com/8063319/173707554-2b65f143-4d78-420e-a908-f5d4fc294e12.png)

## How to use

- Simple:

```javascript
import { generateENXA, prettify } from '@cungminh2710/pseudolocalize';
import IntlMessageFormat from 'intl-messageformat';

const input = 'my name is {name}';

console.log(prettify(generateENXA(input))); // ṁẏ ńâṁè íś {name}
```

- With `react-intl`:

See out [with-react-intl](https://github.com/cungminh2710/pseudolocalize/tree/main/examples/with-react-intl) example
