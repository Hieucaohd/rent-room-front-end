import { gql, useLazyQuery } from '@apollo/client';
import { Avatar, Box, Button, Skeleton, SkeletonText, Tooltip, useToast } from '@chakra-ui/react';
import getSecurityCookie from '@security';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddHome from '@components/home/addhome';
import HomeCard, { HomeCardProps } from '@components/homecard';
import { getUserHomes } from '@lib/apollo/home';
import { motion } from 'framer-motion';
import useStore from '@store/useStore';
import AppAbout from '@components/app-about';
import EmptyData from '@components/emptydata';
import { User } from '@lib/withAuth';
import { GetServerSideProps } from 'next';
import client from '@lib/apollo/apollo-client';
import { EditProfile } from '@components/profile/editprofile';
import { getRoomSaved } from '@lib/apollo/profile';
import { getListRoomByIds } from '@lib/apollo/home/room';
import { RoomSaveCard } from '@components/homecard/roomcard';
import { Paginator, RoomData } from '@lib/interface';

function getSaveRooms(userId: string, SSR: boolean) {
    if (!SSR && userId) {
        const data = getRoomSaved(userId);
        return data;
    }
    return [];
}

function getData(data: any) {
    const dt = data?.profile?.user;
    if (dt) {
        const userType = dt.userType;
        if (userType && userType == 'HOST') {
            return dt ? dt?.listHomes?.docs.slice() : [];
        }
    }
    return [];
}

function getUser(data: any) {
    return data.profile.user;
}

function getPages(data: any) {
    return data?.profile?.user?.listHomes?.paginator;
}

interface ProfileProps {
    data: any;
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    try {
        const { page } = query;
        const Cookie = getSecurityCookie(req);
        if (page) {
            const { data } = await client.query({
                query: gql`
                    query Profile {
                        profile {
                            user {
                                _id
                                email
                                fullname
                                avatar
                                userType
                                province
                                district
                                ward
                                provinceName
                                districtName
                                wardName
                                numberPhone
                            }
                        }
                    }
                `,
                context: {
                    headers: {
                        Cookie,
                    },
                },
                fetchPolicy: 'no-cache',
            });
            if (data && data.profile?.user) {
                return {
                    props: {
                        data,
                    },
                };
            } else {
                throw 'wrong page';
            }
        } else {
            throw 'wrong page';
        }
    } catch (error) {
        console.log(error);
        return {
            notFound: true,
        };
    }
};

const listSkeleton: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function MyHomes({ data: homeData }: ProfileProps) {
    const [getMyHomes, { data }] = useLazyQuery(getUserHomes.command);
    const currentUser: User = getUser(data || homeData);
    const { createPopup, removePopup, user, SSR } = useStore((state) => ({
        createPopup: state.createPopup,
        removePopup: state.removePopup,
        SSR: state.user.SSR,
        user: state.user.info,
    }));

    const listHome: HomeCardProps[] = getData(data || homeData);
    const pageRouter: Paginator = getPages(data || homeData);

    const listRoomId = getSaveRooms(currentUser._id, SSR);
    const [listRoom, setListRoom] = useState<RoomData[] | null>(null);
    const [loadingListRoom, setLoadingListRoom] = useState(true);
    const [roomPageRouter, setRoomPageRouter] = useState<Paginator | null>(null);

    const router = useRouter();
    const { page, userid } = router.query;

    const toast = useToast();
    const {} = useStore((state) => state.user);
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
    }, [page]);

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

    const roomCallBack = useCallback(async () => {
        const p = page ? parseInt(page.toString()) : 1;
        console.log(listRoomId, !isHost, !isNaN(p), listRoomId, data);
        if (!isHost && !isNaN(p) && listRoomId && data) {
            getListRoomByIds(listRoomId, p).then((res) => {
                if (res) {
                    setListRoom(res.docs);
                    setRoomPageRouter(res.paginator);
                    setLoadingListRoom(false);
                }
            });
        }
    }, [listRoomId]);

    const isHost = useMemo(() => {
        return currentUser.userType == 'HOST';
    }, []);

    useEffect(() => {
        let p = page ? parseInt(page.toString()) : 1;
        if (!isNaN(p)) {
            p = 1;
        }
        if (!isHost && listRoomId && data && !listRoom) {
            getListRoomByIds(listRoomId, p).then((res) => {
                console.log(res);
                if (res?.docs && res.docs.length) {
                    setListRoom(res.docs);
                } else {
                    setListRoom([]);
                }
                setRoomPageRouter(res.paginator);
                setLoadingListRoom(false);
            });
        }
    }, [data, listRoomId]);

    const renderListHome = useMemo(() => {
        if (isHost) {
            return data
                ? listHome?.map &&
                      listHome.map((item, index) => {
                          return (
                              <motion.div key={item._id}>
                                  <HomeCard {...item} afterDelete={dataCallback} />
                              </motion.div>
                          );
                      })
                : listSkeleton.map((_, key) => (
                      <Box key={key}>
                          <Skeleton borderRadius={'10px'} height="270px"></Skeleton>
                          <SkeletonText mt="4" noOfLines={3} spacing="4" />
                      </Box>
                  ));
        } else {
            return !loadingListRoom
                ? listRoom &&
                      listRoom.map((item, index) => {
                          return (
                              <motion.div key={item._id}>
                                  <RoomSaveCard
                                      callBack={roomCallBack}
                                      data={item}
                                      userid={currentUser._id}
                                      height="300px"
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
        }
    }, [data, loadingListRoom, listRoom]);

    const renderListPage = useMemo(() => {
        const route = isHost ? pageRouter : roomPageRouter;
        if (route) {
            const limit = route.totalPages;
            const p = route.page;
            let listPage = [route.page];
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
    }, [pageRouter, roomPageRouter, userid, page]);

    const renderRouterPage = useMemo(() => {
        const route = isHost ? pageRouter : roomPageRouter;
        return (
            <>
                {route && route.hasPrevPage && (
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
                {route && route.hasPrevPage && (
                    <Button
                        onClick={() => {
                            router.push(
                                `${router.pathname.replace('[userid]', `${userid}`)}?page=${
                                    route.prevPage
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
                {route && route.totalDocs > 0 && renderListPage}
                {route && route.hasNextPage && (
                    <Button
                        onClick={() => {
                            router.push(
                                `${router.pathname.replace('[userid]', `${userid}`)}?page=${
                                    route.nextPage
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
                {route && route.hasNextPage && (
                    <Button
                        onClick={() => {
                            router.push(
                                `${router.pathname.replace('[userid]', `${userid}`)}?page=${
                                    route.totalPages - 1
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
            </>
        );
    }, [renderListPage]);

    useEffect(() => {}, [data]);

    return (
        <>
            <Head>
                <title>{currentUser?.fullname}</title>
            </Head>
            <motion.div
                initial={{
                    backgroundPosition: '0px -100vh',
                }}
                animate={{
                    backgroundPosition: '0px 0vh',
                }}
                transition={{
                    duration: 0.5,
                }}
                className="userhomes"
            >
                <div className="userhomes-profile">
                    <Button
                        onClick={() => {
                            createPopup(
                                <EditProfile
                                    closeForm={removePopup}
                                    user={currentUser}
                                    callback={dataCallback}
                                />
                            );
                        }}
                    >
                        <i className="fa-solid fa-pen"></i>
                    </Button>
                    <div>
                        <div className="userhomes-profile__avatar">
                            <Avatar
                                name={currentUser?.fullname}
                                size="2xl"
                                position="relative"
                                children={
                                    <svg
                                        className="avatar__border"
                                        width={'calc(100%)'}
                                        height={'calc(100%)'}
                                    >
                                        <circle
                                            strokeLinecap="round"
                                            stroke-mitterlimit="0"
                                            cx="50%"
                                            cy="50%"
                                            r="calc((100% - 3px)/2)"
                                            strokeWidth="3px"
                                            stroke="gray"
                                            fill="transparent"
                                        />
                                    </svg>
                                }
                                src={currentUser?.avatar}
                            />
                            <div>
                                <h2 className="userhomes-profile__name">{currentUser?.fullname}</h2>
                                <div>
                                    {currentUser.userType == 'HOST' ? (
                                        <>
                                            <Tooltip label="chủ nhà">
                                                <i className="fa-solid fa-medal"></i>
                                            </Tooltip>
                                            Chủ nhà
                                        </>
                                    ) : (
                                        <>
                                            <Tooltip label="người đi thuê">
                                                <i className="fa-solid fa-user"></i>
                                            </Tooltip>
                                            Người dùng
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="userhomes-profile__property userhomes-profile__property--numberphone">
                            <span>
                                <i className="fa-solid fa-phone-flip"></i>SĐT:
                            </span>
                            <span
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        currentUser.numberPhone.toString()
                                    );
                                    toast({
                                        title: `Thông báo`,
                                        status: 'success',
                                        position: 'bottom-left',
                                        description: 'Đã sao chép số điện thoại',
                                        isClosable: true,
                                    });
                                }}
                            >
                                {' '}
                                {currentUser.numberPhone}
                            </span>
                        </div>
                        <div className="userhomes-profile__property">
                            <span>
                                <i className="fa-solid fa-envelope"></i>Email:
                            </span>{' '}
                            <span>{currentUser.email}</span>
                        </div>
                        <div className="userhomes-profile__property">
                            <span>
                                <i className="fa-solid fa-location-dot"></i>Địa chỉ:
                            </span>
                            <span>
                                {' '}
                                {currentUser.provinceName
                                    ? currentUser.wardName +
                                      ', ' +
                                      currentUser.districtName +
                                      ', ' +
                                      currentUser.provinceName
                                    : 'chưa có dữ liệu'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="userhomes-homes">
                    <div className="userhomes__add">
                        {currentUser.userType == 'HOST' ? (
                            <>
                                <h1>Danh sách trọ của bạn</h1>
                                <Button
                                    onClick={() => {
                                        createPopup(
                                            <AddHome
                                                afterUpload={dataCallback}
                                                onClose={() => removePopup()}
                                            />
                                        );
                                    }}
                                >
                                    Thêm trọ
                                </Button>
                            </>
                        ) : (
                            <>
                                <h1>Danh sách phòng đã lưu</h1>
                            </>
                        )}
                    </div>
                    <div
                        className={`userhomes__listhome${
                            data
                                ? !renderListHome || renderListHome.length == 0
                                    ? ' userhomes__listhome--empty'
                                    : ''
                                : ' userhomes__listhome--loading'
                        }`}
                    >
                        {renderListHome && renderListHome.length > 0 ? (
                            renderListHome
                        ) : currentUser.userType == 'HOST' ? (
                            <EmptyData text="bạn chưa thêm phòng nào ở đây" />
                        ) : (
                            <EmptyData text="bạn chưa lưu phòng nào ở đây" />
                        )}
                    </div>
                </div>

                <div className="userhomes__routerpage">
                    <ul>{renderRouterPage}</ul>
                </div>
            </motion.div>
            <AppAbout />
        </>
    );
}
