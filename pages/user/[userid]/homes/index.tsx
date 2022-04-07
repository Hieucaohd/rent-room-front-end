import { useLazyQuery } from '@apollo/client';
import { Box, Button, SimpleGrid, Skeleton, SkeletonText, useDisclosure } from '@chakra-ui/react';
import { AnimatePresence, AnimateSharedLayout, Variants } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddHome from '../../../../components/addhome';
import HomeCard, { HomeCardProps } from '../../../../components/homecard';
import LoadingSpinner from '../../../../components/loadingSpinner';
import { getUserHomes } from '../../../../lib/apollo/home';
import { motion } from 'framer-motion';
import useStore from '../../../../store/useStore';

function getData(data: any) {
    return data ? data?.profile?.user?.listHomes?.docs.slice() : [];
}

interface PageData {
    limit: number;
    page: number;
    nextPage: number;
    prevPage: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    totalDocs: number;
}

interface HomePreview {
    _id: string;
    index: number;
}

function getPages(data: any) {
    return data?.profile?.user?.listHomes?.paginator;
}

const listSkeleton: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const showHomePreview: Variants = {
    show: {
        opacity: 1,
        visibility: 'unset',
    },
    hidden: {
        opacity: 0,
        visibility: 'hidden',
    },
};

export default function MyHomes(props: any) {
    const [getMyHomes, { data, loading }] = useLazyQuery(getUserHomes.command);
    const listHome: HomeCardProps[] = getData(data);
    const pageRouter: PageData = getPages(data);

    const router = useRouter();
    const { page, userid } = router.query;

    const { info: user, SSR } = useStore((state) => state.user);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        if (!user && !SSR) {
            location.href = `/signin?p=${router.asPath}`;
        }
    }, [SSR]);

    useEffect(() => {
        if (page && typeof page == 'string') {
            getMyHomes({
                variables: getUserHomes.variable(page, 12),
            }).then((res) => {});
        } else {
            getMyHomes({
                variables: getUserHomes.variable('1', 12),
            }).then((res) => {});
        }
    }, [router.asPath]);

    const dataCallback = useCallback(async () => {
        if (page && typeof page == 'string') {
            return await getMyHomes({
                variables: getUserHomes.variable(page, 12),
            });
        }
        return await getMyHomes({
            variables: getUserHomes.variable('1', 12),
        });
    }, [page]);

    const renderListHome = useMemo(() => {
        console.log(listHome);
        return listHome.map((item, index) => {
            return (
                <motion.div key={item._id}>
                    <HomeCard
                        {...item}
                        afterDelete={dataCallback}
                        onClick={() => {
                            router.push(`/home/${item._id}`);
                        }}
                    />
                </motion.div>
            );
        });
    }, [listHome]);

    const renderListPage = useMemo(() => {
        if (pageRouter) {
            console.log(pageRouter);
            const limit = pageRouter.totalPages;
            const p = pageRouter.page;
            let listPage = [pageRouter.page];
            for (let i = 1; i <= 4; i++) {
                if (p - i > 0) {
                    listPage = [p - i, ...listPage];
                }
                if (p + i <= limit) {
                    listPage.push(p + i);
                }
            }
            const path = router.pathname.replace('[userid]', `${userid}`);
            console.log(path);
            return listPage.map((item, index) => (
                <li key={index}>
                    <Button
                        onClick={() => {
                            router.push(`${path}?page=${item}`);
                        }}
                        variant="link"
                        _focus={{
                            boxShadow: 'none',
                        }}
                        color="var(--app-color)"
                    >
                        {item}
                    </Button>
                </li>
            ));
        }
        return [];
    }, [pageRouter, userid]);

    useEffect(() => {}, [data]);

    return (
        <>
            <Head>
                <title>{user?.fullname}</title>
            </Head>
            <div className="user-homes">
                <div>
                    <Button onClick={() => setShowAddForm(true)}>add home</Button>
                </div>

                <AnimatePresence>
                    {showAddForm && (
                        <AddHome afterUpload={dataCallback} onClose={() => setShowAddForm(false)} />
                    )}
                </AnimatePresence>

                {!loading ? (
                    <>
                        <div className="user-homes__listhome">{renderListHome}</div>

                        <div className="user-homes__routerpage">
                            <ul>
                                {pageRouter && pageRouter.hasPrevPage && (
                                    <Button
                                        onClick={() => {
                                            router.push(
                                                `${router.pathname.replace(
                                                    '[id]',
                                                    `${userid}`
                                                )}?page=0`
                                            );
                                        }}
                                        variant="link"
                                        _focus={{
                                            boxShadow: 'none',
                                        }}
                                        color="var(--app-color)"
                                    >
                                        {'<<'}
                                    </Button>
                                )}
                                {pageRouter && pageRouter.hasPrevPage && (
                                    <Button
                                        onClick={() => {
                                            router.push(
                                                `${router.pathname.replace(
                                                    '[id]',
                                                    `${userid}`
                                                )}?page=${pageRouter.prevPage}`
                                            );
                                        }}
                                        variant="link"
                                        _focus={{
                                            boxShadow: 'none',
                                        }}
                                        color="var(--app-color)"
                                    >
                                        {'<'}
                                    </Button>
                                )}
                                {pageRouter && pageRouter.totalDocs > 0 && renderListPage}
                                {pageRouter && pageRouter.hasNextPage && (
                                    <Button
                                        onClick={() => {
                                            router.push(
                                                `${router.pathname.replace(
                                                    '[id]',
                                                    `${userid}`
                                                )}?page=${pageRouter.nextPage}`
                                            );
                                        }}
                                        variant="link"
                                        _focus={{
                                            boxShadow: 'none',
                                        }}
                                        color="var(--app-color)"
                                    >
                                        {'>'}
                                    </Button>
                                )}
                                {pageRouter && pageRouter.hasNextPage && (
                                    <Button
                                        onClick={() => {
                                            router.push(
                                                `${router.pathname.replace(
                                                    '[id]',
                                                    `${userid}`
                                                )}?page=${pageRouter.totalPages}`
                                            );
                                        }}
                                        variant="link"
                                        _focus={{
                                            boxShadow: 'none',
                                        }}
                                        color="var(--app-color)"
                                    >
                                        {'>>'}
                                    </Button>
                                )}
                            </ul>
                        </div>
                    </>
                ) : (
                    <div className="user-homes__loading">
                        <LoadingSpinner color="black" />
                    </div>
                )}
            </div>
        </>
    );
}
