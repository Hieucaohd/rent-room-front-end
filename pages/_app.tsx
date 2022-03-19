import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import client from '../lib/apollo/apollo-client';
import '../styles/index.scss';
import { motion } from 'framer-motion';

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
    return (
        <ChakraProvider>
            <ApolloProvider client={client}>
                <AnimatePresence exitBeforeEnter>
                    <Component {...pageProps}  key={router.pathname}/>
                </AnimatePresence>
            </ApolloProvider>
        </ChakraProvider>
    );
}

export default MyApp;
