import type { AppProps } from 'next/app';
import '../styles/index.scss';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo-client';
import Header from '../components/Header';

function MyApp({ Component, pageProps }: AppProps) {
    return <ApolloProvider client={client}>
        <Header />
        <Component {...pageProps} />
    </ApolloProvider>
}

export default MyApp;