import '../styles/globals.css';

import { generateENXD, pseudoIntl } from '@cungminh2710/pseudolocalize';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { type IntlCache, type IntlShape, type MessageFormatElement, RawIntlProvider, createIntl, createIntlCache } from 'react-intl';

function loadLocaleData(locale: string) {
	switch (locale) {
		// case 'other-locale':
		default:
			return import('../compiled-lang/en.json').then((mod) => mod.default);
	}
}

const cache: IntlCache = createIntlCache();

function MyApp({ Component, pageProps }: AppProps) {
	const [messages, setMessages] = useState<Record<string, string> | Record<string, MessageFormatElement[]> | undefined>({});

	const locale = 'en';

	useEffect(() => {
		loadLocaleData(locale).then((messages) => setMessages(messages));
	}, [locale]);

	let intl: IntlShape = createIntl(
		{
			locale,
			messages,
			defaultLocale: locale,
		},
		cache,
	);

	if (process.env.NODE_ENV === 'development' && messages != null) {
		intl = pseudoIntl(generateENXD, messages, locale, cache);
	}

	return (
		<RawIntlProvider value={intl}>
			<Component {...pageProps} />
		</RawIntlProvider>
	);
}

export default MyApp;
