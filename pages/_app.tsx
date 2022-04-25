import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import type { AppContext, AppProps } from 'next/app';
import { NextRouter, useRouter } from 'next/router';
import client from '../lib/apollo/apollo-client';
import 'nprogress/nprogress.css';
import '../styles/index.scss';
import 'swiper/css/bundle';
import 'mapbox-gl/dist/mapbox-gl.css';
import { checkLoggedIn, User } from '../lib/withAuth';
import App from 'next/app';
import useStore from '../store/useStore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Head from 'next/head';
import { getPosition } from '../lib/getPosition';
import Nprogress from 'nprogress';

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
    const { user, addUser, removeUser, imageprev, closeImages, popup } = useStore();
    const router = useRouter();
    const lastPath = useRef<string>('');

    useEffect(() => {
        if (user.SSR && myProps.user) {
            // console.clear();
            /* if (myProps.position) {
                const position = {
                    lng: myProps.position.longitude,
                    lat: myProps.position.latitude,
                };
                addUser({ ...myProps.user, position });
            } else {
                
            } */
            addUser(myProps.user);
            console.log(myProps.user);
        } else if (user.SSR) {
            removeUser();
        }
    }, [user.SSR]);

    useEffect(() => {
        const onChnageStart = () => Nprogress.start();
        const onChnageStop = () => Nprogress.done();
        router.events.on('routeChangeStart', onChnageStart);
        router.events.on('routeChangeComplete', onChnageStop);
        router.events.on('routeChangeError', onChnageStop);

        return () => {
            router.events.off('routeChangeStart', onChnageStart);
            router.events.off('routeChangeComplete', onChnageStop);
            router.events.off('routeChangeError', onChnageStop);
        };
    }, []);

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
        <ChakraProvider>
            <ApolloProvider client={client}>
                <Head>
                    <title>Rent Zoom</title>
                </Head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@200;300;400;600;700;900&display=swap"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&display=swap"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Roboto+Slab:wght@300;400;500;600;700&display=swap"
                />
                <link rel="stylesheet" href="/globalstyles/icons.css" />
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
        // console.log(cookie);
        const user: User = await checkLoggedIn(cookie || '');
        /* let position: any = null;
        if (user && user.province) {
            position = await getPosition(user.province);
        } */
        // console.log(user);
        return {
            myProps: {
                user,
                // position,
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
