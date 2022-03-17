import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import client from '../lib/apollo/apollo-client';
import '../styles/index.scss';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider>
            <ApolloProvider client={client}>
                <Component {...pageProps} />
            </ApolloProvider>
        </ChakraProvider>
    );
}

export default MyApp;
