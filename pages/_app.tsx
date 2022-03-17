import { ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import client from '../lib/apollo/apollo-client';
import useAuth from '../lib/useAuth';
import '../styles/index.scss';
import { ChakraProvider } from '@chakra-ui/react';

function MyApp({ Component, pageProps }: AppProps) {
    const isLoading = useAuth();
    return (
        <ChakraProvider>
            <ApolloProvider client={client}>
                <Header isLoading={isLoading} />
                <Component {...pageProps} />
            </ApolloProvider>
        </ChakraProvider>
    );
}

export default MyApp;
