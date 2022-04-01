import { useLazyQuery } from '@apollo/client';
import { Box, Button, SimpleGrid, Skeleton, SkeletonText } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import AddHome from '../../../../components/addhome';
import HomeCard, { HomeCardProps } from '../../../../components/homecard';
import { getUserHomes } from '../../../../lib/apollo/home';
import useStore from '../../../../store/useStore';

function getData(data: any) {
    return data ? data?.profile?.user?.listHomes?.docs.slice() : [];
}

const listSkeleton: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function MyHomes(props: any) {
    const [getMyHomes, { data, loading }] = useLazyQuery(getUserHomes.command);
    const listHome: HomeCardProps[] = getData(data);

    const router = useRouter();
    const { info: user, SSR } = useStore((state) => state.user);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        if (!user && !SSR) {
            location.href = `/signin?p=${router.asPath}`;
        }
    }, [SSR]);

    useEffect(() => {
        getMyHomes().then((res) => {
            console.log(res);
        });
    }, []);

    const renderListHome = useMemo(() => {
        return listHome.map((item, index) => {
            return <HomeCard {...item} key={item._id} />;
        });
    }, [listHome]);

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
                        <AddHome afterUpload={getMyHomes} onClose={() => setShowAddForm(false)} />
                    )}
                </AnimatePresence>
                <div className="user-homes__listhome">
                    {!loading
                        ? renderListHome
                        : listSkeleton.map((item, index) => (
                              <Box key={index}>
                                  <Skeleton borderRadius={'10px'} height="270px"></Skeleton>
                                  <SkeletonText mt="4" noOfLines={3} spacing="4" />
                              </Box>
                          ))}
                </div>
            </div>
        </>
    );
}
