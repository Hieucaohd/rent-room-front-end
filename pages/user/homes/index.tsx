import { useLazyQuery } from '@apollo/client';
import { Box, Button, Skeleton, SkeletonText, useDisclosure } from '@chakra-ui/react';
import { AnimatePresence, Variants } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddHome from '../../../components/home/addhome';
import HomeCard, { HomeCardProps } from '../../../components/homecard';
import { getUserHomes } from '../../../lib/apollo/home';
import { motion } from 'framer-motion';
import useStore from '../../../store/useStore';
import AppAbout from '../../../components/app-about';
import EmptyData from '../../../components/emptydata';

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

function getPages(data: any) {
    return data?.profile?.user?.listHomes?.paginator;
}

const listSkeleton: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MyHomes(props: any) {
    const [getMyHomes, { data, loading }] = useLazyQuery(getUserHomes.command);
    const listHome: HomeCardProps[] = getData(data);
    const pageRouter: PageData = getPages(data);

    const router = useRouter();
    const { page, userid } = router.query;

    const { info: user, SSR } = useStore((state) => state.user);
    const [showAddForm, setShowAddForm] = useState(false);
    const mount = useRef<boolean>(false);

    useEffect(() => {
        if (!user && !SSR) {
            location.href = `/signin?p=${router.asPath}`;
        }
    }, [SSR]);

    useEffect(() => {
        mount.current = true;

        return () => {
            mount.current = false;
        };
    }, []);

    useEffect(() => {
        // console.log(router.asPath);
        const path = router.asPath.split('/')[1];

        if (!mount.current || path != 'user') {
            return;
        }
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
        return data && listHome?.map
            ? listHome.map((item, index) => {
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
              })
            : listSkeleton.map((_, key) => (
                  <Box key={key}>
                      <Skeleton borderRadius={'10px'} height="270px"></Skeleton>
                      <SkeletonText mt="4" noOfLines={3} spacing="4" />
                  </Box>
              ));
    }, [data]);

    const renderListPage = useMemo(() => {
        if (pageRouter) {
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
            return listPage.map((item, index) => (
                <li key={index}>
                    <Button
                        onClick={() => {
                            router.push(`${path}?page=${item}`);
                        }}
                        isDisabled={page?.toString() == item.toString()}
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
    }, [pageRouter, userid, page]);

    useEffect(() => {}, [data]);

    return (
        <>
            <Head>
                <title>{user?.fullname}</title>
            </Head>
            <div className="user-homes">
                <AnimatePresence>
                    {showAddForm && (
                        <AddHome afterUpload={dataCallback} onClose={() => setShowAddForm(false)} />
                    )}
                </AnimatePresence>
                <div>
                    <div className="user-homes__add">
                        <h1>Danh sách trọ của bạn</h1>
                        <Button onClick={() => setShowAddForm(true)}>add home</Button>
                    </div>
                    <div
                        className={`user-homes__listhome${
                            data
                                ? !renderListHome || renderListHome.length == 0
                                    ? ' user-homes__listhome--empty'
                                    : ''
                                : ' user-homes__listhome--loading'
                        }`}
                    >
                        {renderListHome.length > 0 ? (
                            renderListHome
                        ) : (
                            <EmptyData text="bạn chưa thêm phòng nào ở đây" />
                        )}
                    </div>
                </div>

                <div className="user-homes__routerpage">
                    <ul>
                        {pageRouter && pageRouter.hasPrevPage && (
                            <Button
                                onClick={() => {
                                    router.push(
                                        `${router.pathname.replace('[userid]', `${userid}`)}?page=0`
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
                                        `${router.pathname.replace('[userid]', `${userid}`)}?page=${
                                            pageRouter.prevPage
                                        }`
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
                                        `${router.pathname.replace('[userid]', `${userid}`)}?page=${
                                            pageRouter.nextPage
                                        }`
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
                                        `${router.pathname.replace('[userid]', `${userid}`)}?page=${
                                            pageRouter.totalPages
                                        }`
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
            </div>
            <AppAbout />
        </>
    );
}
