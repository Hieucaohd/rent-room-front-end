import type { AppProps } from 'next/app';
import '../styles/index.scss';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo-client';

function MyApp({ Component, pageProps }: AppProps) {
    return <ApolloProvider client={client}>
        <Component {...pageProps} />
    </ApolloProvider>
}

export default MyApp;