# Pseudolocalize

https://img.shields.io/npm/dw/@cungminh2710/pseudolocalize

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

| Locale  | Message                                      |
| ------- | -------------------------------------------- |
| `en-XA` | `ṁẏ ńâṁè íś {name}`                          |
| `en-XB` | `[!! ṁẏ ńâṁṁṁè íííś  !!]Minh`                |
| `en-XC` | `မြ······ṁẏ ńâṁè íś Minh······မြ`             |
| `en-XD` | `မြ······mẏ nâmè ís Minh······မြ`             |

* As of 1 June 2022, `code` component in this table above will fail for this tall burmese character `မြ`

## How to use

- Simple:

```javascript
import { generateENXA } from '@cungminh2710/pseudolocalize';
import IntlMessageFormat from 'intl-messageformat';

const input = 'my name is {name}';
const name = 'Minh';

console.log(new IntlMessageFormat(generateENXA(input)).format({name})); // ṁẏ ńâṁè íś {name}
```

- With `react-intl`:

```javascript

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { generateENXC } from '@cungminh2710/pseudolocalize';

function loadLocaleData(locale: string) {
  switch (locale) {
    case 'fr':
      return import('compiled-lang/fr.json')
    default:
      return import('compiled-lang/en.json')
  }
}

function App(props) {
	const messages = React.useMemo(() => {
		if (!props.messages) return {};
		if (process.env.NODE_ENV === 'development') {
			let m: Record<string, MessageFormatElement[]> = {};
			Object.keys(props.messages).forEach((key) => {
				m[String(key)] = generateENXC(props.messages[String(key)]);
			});
			return m;
		}

		return props.messages;
	}, [props.messages]);

	return (
		<IntlProvider
		  locale={props.locale}
		  defaultLocale="en"
		  messages={messages}
		>
		  <MainApp />
		</IntlProvider>
	)
}

async function bootstrapApplication(locale, mainDiv) {
  const messages = await loadLocaleData(locale)
  ReactDOM.render(<App locale={locale} messages={messages} />, mainDiv)
}

```
