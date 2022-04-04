import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import type { AppContext, AppProps } from 'next/app';
import { NextRouter, useRouter } from 'next/router';
import client from '../lib/apollo/apollo-client';
import '../styles/index.scss';
import { checkLoggedIn, User } from '../lib/withAuth';
import App from 'next/app';
import useStore from '../store/useStore';
import { useCallback, useEffect } from 'react';
import Header from '../components/Header';
import Head from 'next/head';

interface MyAppProps extends AppProps {
    myProps: {
        user: User | null;
    };
}

const getPath = (path: string) => {
    const pathname = path.split('/')[1];
    return '/' + pathname;
};

function MyApp({ Component, pageProps, myProps }: MyAppProps) {
    const { user, addUser, removeUser } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (user.SSR && myProps.user) {
            // console.clear();
            addUser(myProps.user);
            console.log(user, myProps);
        } else if (user.SSR) {
            removeUser();
        }
    }, [user.SSR]);

    useEffect(() => {
        const handleLoading = () => {
            document.body.style.cursor = 'wait';
        };
        const handleComplete = () => {
            document.body.style.cursor = 'default';
        };
        router.events.on('routeChangeStart', handleLoading);
        router.events.on('routeChangeComplete', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleLoading);
            router.events.off('routeChangeComplete', handleComplete);
        };
    }, [router.pathname]);

    const withoutPage = useCallback((router: NextRouter) => {
        const path = getPath(router.pathname);
        const without = ['/signin', '/signup'];
        const isCurrent = without.find((item) => item === path);
        return !isCurrent;
    }, []);

    return (
        <ChakraProvider>
            <ApolloProvider client={client}>
                <Head>
                    <title>Rent Zoom</title>
                </Head>
                <AnimatePresence>
                    {withoutPage(router) && <Header user={user.info} />}
                </AnimatePresence>
                <div className={`main${withoutPage(router) ? ' bar' : ''}`}>
                    <AnimatePresence exitBeforeEnter>
                        <Component {...pageProps} key={router.pathname} />
                    </AnimatePresence>
                </div>
            </ApolloProvider>
        </ChakraProvider>
    );
}

MyApp.getInitialProps = async (context: AppContext) => {
    const pageProps = await App.getInitialProps(context);
    const req = context.ctx.req;
    if (req) {
        const cookie = req.headers.cookie;
        // console.log(cookie);
        const user = await checkLoggedIn(cookie || '');
        // console.log(user);
        return {
            myProps: {
                user,
            },
            ...pageProps,
        };
    }

    return {
        ...pageProps,
        myProps: {
            user: null,
        },
    };
};

export default MyApp;
