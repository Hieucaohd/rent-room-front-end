import { ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import client from '../lib/apollo-client';
import useAuth from '../lib/useAuth';
import '../styles/index.scss';

function MyApp({ Component, pageProps }: AppProps) {
    const isLoading = useAuth();
    return (
        <ApolloProvider client={client}>
            <Header />
            <Component {...pageProps} />
        </ApolloProvider>
    );
}

export default MyApp;
