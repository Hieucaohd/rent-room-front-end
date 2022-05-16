import { gql, useQuery } from '@apollo/client';
import { Avatar, Box, Button, Skeleton, SkeletonText, Tooltip, useToast } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef } from 'react';
import HomeCard, { HomeCardProps } from '@components/homecard';
import { motion } from 'framer-motion';
import AppAbout from '@components/app-about';
import EmptyData from '@components/emptydata';
import { User } from '@lib/withAuth';
import { GetServerSideProps } from 'next';
import client from '@lib/apollo/apollo-client';
import { getUserById } from '@lib/apollo/profile';
import { Paginator } from '@lib/interface';

function getData(data: any) {
    const dt = data?.getUserById;
    if (dt) {
        return dt ? dt?.listHomes?.docs.slice() : [];
    }
    return [];
}

function getUser(data: any) {
    return data?.getUserById;
}

/*  */

function getPages(data: any) {
    return data?.getUserById?.listHomes?.paginator;
}

interface ProfileProps {
    data: any;
    userId: string;
    page: number;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    try {
        const { _id, page } = query;
        if (_id) {
            const { data } = await client.query({
                query: gql`
                    query GetUserById($getUserByIdId: ID!) {
                        getUserById(id: $getUserByIdId) {
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
                `,
                variables: {
                    getUserByIdId: _id.toString(),
                },
                fetchPolicy: 'no-cache',
            });

            if (data && data.getUserById) {
                if (data.getUserById?.userType == 'HOST') {
                    let p = page ? parseInt(page.toString()) : 1;
                    if (isNaN(p)) {
                        p = 1;
                    }
                    return {
                        props: {
                            data,
                            userId: _id,
                            page: p,
                        },
                    };
                } else {
                    throw 'wrong page';
                }
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

export default function Profile({ data: homeData, userId, page }: ProfileProps) {
    const router = useRouter();
    const { data, refetch, loading } = useQuery(getUserById.command, {
        variables: getUserById.variables(userId, page),
    });
    const currentUser: User = getUser(data || homeData);

    const listHome: HomeCardProps[] = getData(data || homeData);
    const pageRouter: Paginator = getPages(data || homeData);

    const toast = useToast();
    const mount = useRef<boolean>(false);

    useEffect(() => {
        mount.current = true;

        return () => {
            mount.current = false;
        };
    }, []);

    const renderListHome = useMemo(() => {
        return data
            ? listHome?.map &&
                  listHome.map((item, index) => {
                      return (
                          <motion.div key={item._id}>
                              <HomeCard {...item} removeAble={false} />
                          </motion.div>
                      );
                  })
            : listSkeleton.map((_, key) => (
                  <Box key={key}>
                      <Skeleton borderRadius={'10px'} height="270px"></Skeleton>
                      <SkeletonText mt="4" noOfLines={3} spacing="4" />
                  </Box>
              ));
    }, [data, page]);

    const renderListPage = useMemo(() => {
        const route = pageRouter;
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
            const path = router.pathname.replace('[_id]', `${userId}`);
            return listPage.map((item, index) => (
                <li key={index}>
                    <Button
                        onClick={() => {
                            router.push(`${path}?page=${item}`);
                        }}
                        isDisabled={page.toString() == item.toString()}
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
    }, [pageRouter, userId, page]);

    const renderRouterPage = useMemo(() => {
        const route = pageRouter;
        return (
            <>
                {route && route.hasPrevPage && (
                    <Button
                        onClick={() => {
                            router.push(`${router.pathname.replace('[_id]', `${userId}`)}?page=1`);
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
                                `${router.pathname.replace('[_id]', `${userId}`)}?page=${
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
                                `${router.pathname.replace('[_id]', `${userId}`)}?page=${
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
                                `${router.pathname.replace('[_id]', `${userId}`)}?page=${
                                    route.totalPages
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
