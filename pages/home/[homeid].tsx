import { gql, useLazyQuery } from '@apollo/client';
import { Avatar, Box, Button, Skeleton } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { signUpBtnStyle } from '@chakra';
import AddZoom from '@components/home/addhome/addroom';
import Gallery, { GallerySkeleton } from '@components/gallery';
import RoomCard from '@components/homecard/roomcard';
import { getHomeById } from '@lib/apollo/home/gethomebyid';
import useStore from '@store/useStore';
import ModifyHomePrices, { EditDescription, EditHomeLocation } from '@components/home/modifyhome';
import { AnimatePresence, motion } from 'framer-motion';
import HomeImagePreivew from '@components/image-preview';
import EmptyData from '@components/emptydata';
import MapBox from '@components/mapbox';
import getTitleHome from '@lib/getNameHome';
import { GetServerSideProps } from 'next';
import getSecurityCookie from '@security';
import client from '@lib/apollo/apollo-client';
import AppAbout from '@components/app-about';
import Link from 'next/link';
import { HomeData, ListZoomData, Paginator } from '@lib/interface';
import useResize from '@lib/use-resize';
import DeleteHome from '@components/home/modifyhome/deleteHome';

const getData = (data: any) => {
    const dt = data?.getHomeById;
    /* const cloneData = {...dt}
    if (dt && dt.description){
        dt.description = JSON.parse(dt.description)
    } */
    return dt;
};

const getListZoom = (data: any) => {
    const dt = data?.getHomeById?.listRooms;
    return dt;
};

interface HomePageProps {
    homeId: string;
    homeSSRData: HomeData;
    isOwner: string;
    page: number;
}

function getPages(data: any) {
    return data?.paginator;
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const Cookie = getSecurityCookie(req);
    let user: { _id: string } | null = null;
    let { homeid: homeId, p } = query;
    if (homeId) {
        try {
            if (Cookie) {
                const { data } = await client.query({
                    query: gql`
                        query User {
                            profile {
                                user {
                                    _id
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
                user = data?.profile?.user;
            }
        } catch (error) {
            console.log(error);
        }
        try {
            let page = 1;
            if (p) {
                page = parseInt(p.toString());
                if (isNaN(page)) {
                    page = 1;
                }
            }
            const { data: data2 } = await client.query({
                query: getHomeById.command,
                variables: getHomeById.variables(homeId.toString(), page, 10),
                fetchPolicy: 'no-cache',
            });
            const homeData = getData(data2);
            return {
                props: {
                    homeSSRData: homeData,
                    homeId: homeId.toString(),
                    isOwner: user?._id == homeData?.owner?._id,
                    page,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                notFound: true,
            };
        }
    } else {
        return {
            notFound: true,
        };
    }
};

const Home = ({ homeSSRData, homeId, isOwner, page }: HomePageProps) => {
    const router = useRouter();
    const {
        info: user,
        showImagePreview,
        closeImagePreview,
        isServerSide,
        createPopup,
        removePopup,
    } = useStore((state) => ({
        info: state.user.info,
        isServerSide: state.user.SSR,
        showedImage: !!state.imageprev,
        showImagePreview: state.setImages,
        closeImagePreview: state.closeImages,
        createPopup: state.createPopup,
        removePopup: state.removePopup,
    }));
    const [getHomeData, { data }] = useLazyQuery(getHomeById.command);
    const [loading, setLoading] = useState(true);
    const homeData: HomeData = useMemo(() => {
        if (!data) {
            return homeSSRData;
        }
        return getData(data);
    }, [data]);

    const pageRouter: Paginator = getPages(homeData.listRooms);
    const [homeDescription, setHomeDescription] = useState<
        {
            key: string;
            des: string;
        }[]
    >([]);
    const [showMoreDes, setShowMoreDes] = useState(false); // state quản lý hiển thị thêm mô tả trọ
    const listZoom: ListZoomData = useMemo(() => {
        if (!data) {
            return homeSSRData.listRooms;
        }
        return getListZoom(data);
    }, [data]);

    const [showprice] = useResize(750);
    const [showMapBox, setShowMapBox] = useState(true);

    //state form
    const [modifyPrice, setModifyPrice] = useState(false);

    const refreshData = useCallback(() => {
        return getHomeData({
            variables: getHomeById.variables(homeId),
        }).catch((error: Error) => {
            console.log(error.message);
        });
    }, []);

    useEffect(() => {
        if (modifyPrice) {
            createPopup(
                <ModifyHomePrices
                    closeForm={() => {
                        setModifyPrice(false);
                        removePopup();
                    }}
                    callback={refreshData}
                    {...homeData}
                />
            );
        }
    }, [modifyPrice]);

    useEffect(() => {
        if (homeData) {
            const dataDes = JSON.parse(homeData.description);
            setHomeDescription(dataDes);
            setLoading(false);
        }
    }, [homeData]);

    // console.log(homeDescription);

    const renderDescription = useMemo(() => {
        if (!homeDescription || homeDescription.length == 0) {
            return null;
        }
        let limit = 0;
        if (homeDescription[0].des == '') {
            limit = 1;
        }
        return [
            homeDescription.map((item, index) => {
                if (index > limit) {
                    return null;
                }
                return (
                    <motion.div key={index}>
                        <h1>{item.key}</h1>
                        <p>{item.des}</p>
                    </motion.div>
                );
            }),
            homeDescription.map((item, index) => {
                if (index <= limit) {
                    return null;
                }
                return (
                    <motion.div key={index}>
                        <h1>{item.key}</h1>
                        <p>{item.des}</p>
                    </motion.div>
                );
            }),
        ];
    }, [homeDescription, showMoreDes]);

    const placeName = useMemo(() => {
        if (homeData) {
            return (
                homeData.wardName +
                ', ' +
                homeData.districtName.replace('Quận ', '').replace('Huyện ', '') +
                ', ' +
                homeData.provinceName.replace('Thành phố ', '').replace('Tỉnh ', '')
            );
        }
    }, [homeData]);

    const homeIcon = useMemo(() => {
        if (!loading && homeId && !isServerSide) {
            const div = document.createElement('div');
            div.className = 'homeicon';
            div.innerHTML = `<svg display="block" height="41px" width="27px" viewBox="0 0 27 41"><defs><radialGradient id="shadowGradient"><stop offset="10%" stop-opacity="0.4"></stop><stop offset="100%" stop-opacity="0.05"></stop></radialGradient></defs><ellipse cx="13.5" cy="34.8" rx="10.5" ry="5.25" fill="url(#shadowGradient)"></ellipse><path fill="#3FB1CE" d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"></path><path opacity="0.25" d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"></path><circle fill="white" cx="13.5" cy="13.5" r="5.5"></circle></svg>`;
            const child = document.createElement('div');
            child.innerHTML = `${placeName}<div></div>`;
            div.appendChild(child);
            return div;
        }
    }, [loading, homeId, isServerSide]);

    const priceTag = useMemo(() => {
        return (
            <div className="homepage-sprice">
                <div className="homepage-sprice__info">
                    <h2>Đơn giá tháng</h2>

                    <div>
                        <span>{'Tiền phòng: '}</span>
                        <br />
                        &nbsp;&nbsp;
                        {' ● Tối thiểu: ' +
                            (homeData.minPrice ? homeData.minPrice + ' VNĐ' : 'chưa có dữ liệu')}
                        <br />
                        &nbsp;&nbsp;
                        {' ● Tối đa: ' +
                            (homeData.maxPrice ? homeData.maxPrice + ' VNĐ' : 'chưa có dữ liệu')}
                    </div>
                    <div>
                        <span>{'Tiền điện: '}</span>
                        {homeData.electricityPrice}
                        {' VNĐ'}
                    </div>
                    <div>
                        <span>{'Tiền nước: '}</span>
                        {homeData.waterPrice}
                        {' VNĐ'}
                    </div>
                    <div>
                        <span>{'Tiền vệ sinh: '}</span>
                        {homeData.cleaningPrice
                            ? homeData.cleaningPrice + ' VNĐ'
                            : 'chưa có thông tin'}
                    </div>
                    <div>
                        <span>{'Tiền mạng: '}</span>
                        {homeData.internetPrice
                            ? homeData.internetPrice + ' VNĐ'
                            : 'chưa có thông tin'}
                    </div>
                </div>
                {isOwner ? (
                    <div className="homepage-sprice__action">
                        <Button
                            {...signUpBtnStyle}
                            backgroundColor="var(--app-btn-bgcolor)"
                            height="35px"
                            fontWeight="bold"
                            onClick={() => setModifyPrice(true)}
                        >
                            Chỉnh sửa
                        </Button>
                        <Button
                            colorScheme="red"
                            height="35px"
                            className="homepage__delete"
                            onClick={() => {
                                createPopup(
                                    <DeleteHome closeForm={removePopup} homeData={homeData} />
                                );
                            }}
                        >
                            Xóa Trọ
                        </Button>
                    </div>
                ) : (
                    <Button {...signUpBtnStyle}>
                        <a href={`tel:${homeData.owner.numberPhone}`}>
                            <i className="fa-solid fa-phone-flip"></i>
                            {homeData.owner.numberPhone}
                        </a>
                    </Button>
                )}
            </div>
        );
    }, [homeData]);

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
            const path = router.pathname.replace('[homeid]', `${homeId}`);
            return listPage.map((item, index) => (
                <li key={index}>
                    <Button
                        onClick={() => {
                            router.push(`${path}?p=${item}`);
                        }}
                        isDisabled={page == item}
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
    }, [pageRouter, homeId, page]);

    return (
        <>
            <div className="homepage-base">
                <div className="homepage">
                    {true && homeId ? (
                        <>
                            <div className="homepage__title">
                                <h1>
                                    {getTitleHome(homeData).value}
                                    {isOwner && (
                                        <Button
                                            variant="link"
                                            _focus={{
                                                boxShadow: 'none',
                                            }}
                                            onClick={() => {
                                                setShowMapBox(false);
                                                createPopup(
                                                    <EditHomeLocation
                                                        closeForm={() => {
                                                            removePopup();
                                                            setTimeout(() => {
                                                                setShowMapBox(true);
                                                            }, 400);
                                                        }}
                                                        user={user!}
                                                        callback={refreshData}
                                                        {...homeData}
                                                    />
                                                );
                                            }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </Button>
                                    )}
                                </h1>
                                <h3>
                                    <i className="fa-solid fa-user-group"></i>
                                    {homeData?.liveWithOwner
                                        ? 'Sống cùng chủ nhà'
                                        : 'Không sống với chủ nhà'}
                                </h3>
                                {/*  */}
                            </div>
                            <div className="homepage-images">
                                <Gallery images={homeData.images} />
                                <Button
                                    display="flex"
                                    gap="5px"
                                    bgColor="white"
                                    color="black"
                                    opacity={0.9}
                                    onClick={() => {
                                        showImagePreview(
                                            <HomeImagePreivew
                                                key={homeId}
                                                images={homeData.images}
                                                homeId={homeId}
                                                owner={homeData.owner._id}
                                                onChange={() => {
                                                    getHomeData({
                                                        variables: getHomeById.variables(homeId),
                                                    }).catch((error: Error) => {
                                                        console.log(error.message);
                                                    });
                                                }}
                                                close={closeImagePreview}
                                            />
                                        );
                                    }}
                                >
                                    <i className="fa-solid fa-border-all"></i>
                                    Xem tất cả
                                </Button>
                            </div>
                            <div className="homepage-body">
                                <div>
                                    <div className="homepage-owner">
                                        <div className="homepage-owner__title">
                                            <h1>
                                                {'Khu trọ được cho thuê bởi chủ nhà '}
                                                <span>
                                                    <Link href={`/user/${homeData.owner._id}`}>
                                                        <a>{homeData.owner.fullname}</a>
                                                    </Link>
                                                </span>
                                            </h1>
                                            <div>
                                                {homeData.totalRooms ? homeData.totalRooms : 0}
                                                {' phòng'}
                                            </div>
                                            {/*  ● */}
                                        </div>
                                        <div className="homepage-owner__avatar">
                                            <Avatar
                                                size="lg"
                                                name={homeData.owner.fullname}
                                                src={homeData.owner.avatar}
                                            />
                                        </div>
                                    </div>
                                    {showprice && priceTag}
                                    <div className="homepage-description">
                                        <hr />
                                        <h1>
                                            Mô tả từ chủ nhà
                                            {isOwner && (
                                                <Button
                                                    variant="link"
                                                    _focus={{
                                                        boxShadow: 'none',
                                                    }}
                                                    onClick={() => {
                                                        createPopup(
                                                            <EditDescription
                                                                closeForm={() => {
                                                                    removePopup();
                                                                }}
                                                                homeId={homeData._id}
                                                                callback={refreshData}
                                                                defautDes={homeDescription}
                                                            />
                                                        );
                                                    }}
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </Button>
                                            )}
                                        </h1>
                                        <div className="homepage-description__description">
                                            {homeData.description ? (
                                                <>
                                                    {renderDescription && renderDescription[0]}
                                                    <AnimatePresence>
                                                        {renderDescription && showMoreDes && (
                                                            <motion.div
                                                                style={{
                                                                    overflow: 'hidden',
                                                                }}
                                                                initial={{ height: 0 }}
                                                                animate={{
                                                                    height: 'auto',
                                                                    opacity: 1,
                                                                }}
                                                                exit={{
                                                                    height: 0,
                                                                    opacity: 0,
                                                                }}
                                                                transition={{
                                                                    duration: 0.25,
                                                                }}
                                                            >
                                                                {renderDescription[1]}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            ) : (
                                                <EmptyData text="hiện chưa có mô tả từ chủ trọ" />
                                            )}
                                        </div>
                                        {homeData.description && (
                                            <Button
                                                className="homepage-description__showmore"
                                                variant="link"
                                                onClick={() => {
                                                    setShowMoreDes((prev) => !prev);
                                                }}
                                            >
                                                {showMoreDes ? 'Thu gọn' : 'Hiển thị thêm'}
                                            </Button>
                                        )}
                                        <hr />
                                    </div>
                                    <div className="homerooms">
                                        {/* show zoom */}
                                        {user && isOwner && (
                                            <div className="homezooms__add">
                                                {/*@ts-ignore */}
                                                <AddZoom
                                                    homeId={homeId}
                                                    user={user}
                                                    callback={refreshData}
                                                />
                                            </div>
                                        )}
                                        <div className="homezooms__listlabel">Danh sách phòng</div>

                                        {listZoom?.docs && listZoom.docs.length > 0 ? (
                                            <>
                                                <div className="homezooms__list">
                                                    {listZoom.docs.map((item, index) => (
                                                        <RoomCard
                                                            data={item}
                                                            key={index}
                                                            height="300px"
                                                        />
                                                    ))}
                                                </div>
                                                <div className="userhomes__routerpage">
                                                    <ul>
                                                        {pageRouter && pageRouter.hasPrevPage && (
                                                            <Button
                                                                onClick={() => {
                                                                    router.push(
                                                                        `${router.pathname.replace(
                                                                            '[homeid]',
                                                                            `${homeId}`
                                                                        )}?p=0`
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
                                                                            '[homeid]',
                                                                            `${homeId}`
                                                                        )}?p=${pageRouter.prevPage}`
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
                                                        {pageRouter &&
                                                            pageRouter.totalDocs > 0 &&
                                                            renderListPage}
                                                        {pageRouter && pageRouter.hasNextPage && (
                                                            <Button
                                                                onClick={() => {
                                                                    router.push(
                                                                        `${router.pathname.replace(
                                                                            '[homeid]',
                                                                            `${homeId}`
                                                                        )}?p=${pageRouter.nextPage}`
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
                                                                            '[homeid]',
                                                                            `${homeId}`
                                                                        )}?p=${
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
                                            </>
                                        ) : (
                                            <EmptyData text="hiện chưa có phòng nào ở đây" />
                                        )}
                                    </div>

                                    <div className="homepage-map">
                                        <hr></hr>
                                        <h2 className="homepage-map__title">Vị trí trọ</h2>
                                        <div className="homepage-map__placename">{placeName}</div>
                                        {showMapBox &&
                                            (homeData?.position &&
                                            homeData.position.lat &&
                                            homeData.position.lng ? (
                                                <MapBox
                                                    key={JSON.stringify(homeData.position)}
                                                    choosePlace={false}
                                                    // markerIcon={homeIcon}
                                                    center={[
                                                        homeData.position.lng,
                                                        homeData.position.lat,
                                                    ]}
                                                />
                                            ) : (
                                                <MapBox
                                                    key={
                                                        JSON.stringify(homeData.province) +
                                                        JSON.stringify(homeData.district) +
                                                        JSON.stringify(homeData.ward)
                                                    }
                                                    choosePlace={false}
                                                    {...(homeData?.province
                                                        ? { province: homeData.province }
                                                        : {})}
                                                    {...(homeData?.district
                                                        ? { district: homeData.district }
                                                        : {})}
                                                    {...(homeData?.ward
                                                        ? { ward: homeData.ward }
                                                        : {})}
                                                />
                                            ))}
                                    </div>
                                </div>
                                {!showprice && priceTag}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="homepage__title">
                                <h1>
                                    <Skeleton height="2rem" width="60%" />
                                </h1>
                                <h3 style={{ display: 'block' }}>
                                    <Skeleton height="1.6rem" width="30%" />
                                </h3>
                            </div>
                            <div className="homepage-images">
                                <GallerySkeleton />
                            </div>
                            <div className="homepage-body">
                                <div>
                                    <div className="homepage-owner" style={{ width: '100%' }}>
                                        <div
                                            className="homepage-owner__title"
                                            style={{ width: '100%' }}
                                        >
                                            <h1>
                                                <Skeleton height="30px" />
                                            </h1>
                                            <div>
                                                <Skeleton
                                                    height="20px"
                                                    width="30%"
                                                    marginTop="10px"
                                                />
                                            </div>
                                            {/*  ● */}
                                        </div>
                                        <div
                                            className="homepage-owner__avatar"
                                            style={{ width: '60px' }}
                                        >
                                            <Skeleton
                                                borderRadius="100%"
                                                style={{ width: '60px', height: '60px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <AppAbout />
        </>
    );
};

export default memo(Home);
