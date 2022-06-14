import '../styles/globals.css';
import type { AppProps } from 'next/app';
import messages from '../compiled-lang/en.json';
import { generateENXD, pseudoIntl } from '@cungminh2710/pseudolocalize';
import { IntlProvider, RawIntlProvider } from 'react-intl';

function MyApp({ Component, pageProps }: AppProps) {
  if (process.env.NODE_ENV === 'development') {
    const intl = pseudoIntl(generateENXD, messages, 'en');
    return (
      <RawIntlProvider value={intl}>
        <Component {...pageProps} />
      </RawIntlProvider>
    );
  } else {
    return (
      <IntlProvider messages={messages} locale="en">
        <Component {...pageProps} />
      </IntlProvider>
    );
  }
}

export default MyApp;
