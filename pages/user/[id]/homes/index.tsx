import { useLazyQuery } from '@apollo/client';
import { Box, Button, SimpleGrid, Skeleton, SkeletonText, useDisclosure } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import AddHome from '../../../../components/addhome';
import HomeCard, { HomeCardProps } from '../../../../components/homecard';
import LoadingSpinner from '../../../../components/loadingSpinner';
import { getUserHomes } from '../../../../lib/apollo/home';
import { getPathFileFromLink } from '../../../../lib/upLoadAllFile';
import useStore from '../../../../store/useStore';

function getData(data: any) {
    return data ? data?.profile?.user?.listHomes?.docs.slice() : [];
}

const listSkeleton: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MyHomes(props: any) {
    const [getMyHomes, { data, loading }] = useLazyQuery(getUserHomes.command);
    const listHome: HomeCardProps[] = getData(data);

    const router = useRouter();
    const { page } = router.query;

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
    }, []);

    const renderListHome = useMemo(() => {
        return listHome.map((item, index) => {
            return <HomeCard {...item} afterDelete={getMyHomes} key={item._id} />;
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

                {!loading ? (
                    <div className="user-homes__listhome">{renderListHome}</div>
                ) : (
                    <div className="user-homes__loading">
                        <LoadingSpinner color="black" />
                    </div>
                )}
            </div>
        </>
    );
}
