import { ApolloProvider } from '@apollo/client';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { AppContext, AppProps } from 'next/app';
import App from 'next/app';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import Nprogress from 'nprogress';
import 'nprogress/nprogress.css';
import React, { useCallback, useEffect } from 'react';
import 'swiper/css/bundle';
import Header from '@components/Header';
import client from '@lib/apollo/apollo-client';
import { checkLoggedIn, User } from '@lib/withAuth';
import useStore from '@store/useStore';
import 'styles/index.scss';
import { disableReactDevTools } from '@lib/disableReactDevTools';

interface MyAppProps extends AppProps {
    myProps: {
        user: User | null;
        position: any;
    };
}

const getPath = (path: string) => {
    const pathname = path.split('/')[1];
    return '/' + pathname;
};

function MyApp({ Component, pageProps, myProps }: MyAppProps) {
    const { user, addUser, removeUser, imageprev, removePopup, popup } = useStore();
    const router = useRouter();
    useEffect(() => {
        console.log(myProps);
        if (user.SSR && myProps.user) {
            addUser(myProps.user);
        } else if (user.SSR) {
            removeUser();
        } else if (!user.SSR) {
            process.env.NODE_ENV == 'production' && disableReactDevTools();
        }
    }, [user.SSR]);

    useEffect(() => {
        const onChnageStart = () => {
            Nprogress.start();
            if (popup) {
                removePopup();
            }
        };
        const onChnageStop = () => {
            Nprogress.done();
            if (popup) {
                removePopup();
            }
        };
        router.events.on('routeChangeStart', onChnageStart);
        router.events.on('routeChangeComplete', onChnageStop);
        router.events.on('routeChangeError', onChnageStop);

        return () => {
            router.events.off('routeChangeStart', onChnageStart);
            router.events.off('routeChangeComplete', onChnageStop);
            router.events.off('routeChangeError', onChnageStop);
        };
    }, [popup]);

    const withoutPage = useCallback((router: NextRouter) => {
        const path = getPath(router.pathname);
        const without = ['/signin', '/signup'];
        const isCurrent = without.find((item) => item === path);
        return !isCurrent;
    }, []);

    useEffect(() => {
        if (imageprev) {
            const next = document.querySelector('html');
            if (next) {
                next.style.overflowY = 'hidden';
            }
        } else {
            const next = document.querySelector('html');
            if (next) {
                next.style.overflowY = 'unset';
            }
        }
    }, [imageprev]);

    return (
        <ChakraProvider theme={theme}>
            <ApolloProvider client={client}>
                <Head>
                    <title>Tìm phòng trọ</title>
                </Head>
                <AnimatePresence>
                    {withoutPage(router) && <Header user={user.info} />}
                </AnimatePresence>
                <div id="main" className={`main${withoutPage(router) ? ' bar' : ''}`}>
                    <AnimatePresence exitBeforeEnter>
                        <Component {...pageProps} key={router.pathname} />
                    </AnimatePresence>
                </div>
                <AnimatePresence>{imageprev}</AnimatePresence>
                <AnimatePresence>{popup}</AnimatePresence>
            </ApolloProvider>
        </ChakraProvider>
    );
}

MyApp.getInitialProps = async (context: AppContext) => {
    const pageProps = await App.getInitialProps(context);
    const req = context.ctx.req;
    if (req) {
        const cookie = req.headers.cookie;
        const user: User = await checkLoggedIn(cookie || '');
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
