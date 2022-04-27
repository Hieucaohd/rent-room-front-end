import { gql, useLazyQuery } from '@apollo/client';
import { Avatar, Button, Skeleton, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { signUpBtnStyle } from '../../chakra';
import AddZoom from '../../components/home/addhome/addzoom';
import Gallery, { GallerySkeleton } from '../../components/gallery';
import RoomCard, { ZoomData } from '../../components/homecard/roomcard';
import { getHomeById } from '../../lib/apollo/home/gethomebyid';
import { getPlaceName } from '../../lib/getPosition';
import useStore from '../../store/useStore';
import ModifyHomePrices from '../../components/home/modifyhome';
import EditHomeLocation from '../../components/home/modifyhome/editLocation';
import EditDescription from '../../components/home/modifyhome/editDescription';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import HomeImagePreivew from '../../components/image-preview';
import EmptyData from '../../components/emptydata';
import MapBox from '../../components/mapbox';
import Link from 'next/link';
import getTitleHome from '../../lib/getNameHome';
import { GetServerSideProps } from 'next';
import getSecurityCookie from '../../security';
import client from '../../lib/apollo/apollo-client';

export interface ListZoomData {
    docs: ZoomData[];
    paginator: {
        limit: number;
        page: number;
        nextPage: number;
        prevPage: number;
        totalPages: number;
        pagingCounter: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        totalDocs: number;
    };
}

export interface HomeData {
    _id: string;
    owner: {
        _id: string;
        fullname: string;
        avatar: string;
    };
    provinceName: string;
    districtName: string;
    wardName: string;
    liveWithOwner: boolean;
    electricityPrice: number;
    waterPrice: number;
    images: string[];
    totalRooms: number;
    internetPrice: number;
    cleaningPrice: number;
    description: string;
    position: {
        lng: number;
        lat: number;
    };
    listRooms: ListZoomData;
    title?: string;
    detailAddress?: string;
}

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
    homeSSRData: string;
    isOwner: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const Cookie = getSecurityCookie(req);
    let user: { _id: string } | null = null;
    const { homeid: homeId } = query;
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
            const { data: data2 } = await client.query({
                query: getHomeById.command,
                variables: getHomeById.variables(homeId.toString()),
            });
            const homeData = getData(data2);
            return {
                props: {
                    homeSSRData: homeData,
                    homeId: homeId.toString(),
                    isOwner: user?._id == homeData?.home?.owner?._id,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                redirect: {
                    permanent: false,
                    destination: '/404',
                },
            };
        }
    } else {
        return {
            redirect: {
                permanent: false,
                destination: '/404',
            },
        };
    }
};

const Home = ({ homeSSRData, homeId, isOwner }: HomePageProps) => {
    const router = useRouter();
    const {
        info: user,
        showImagePreview,
        closeImagePreview,
        isServerSide,
        showedImage,
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
            return homeSSRData
        } 
        return getData(data)
    }, [data]);
    const [homeDescription, setHomeDescription] = useState<
        {
            key: string;
            des: string;
        }[]
    >([]);
    const [showMoreDes, setShowMoreDes] = useState(false); // state quản lý hiển thị thêm mô tả trọ
    const listZoom: ListZoomData = getListZoom(data);

    const [showMapBox, setShowMapBox] = useState(true);

    //state form
    const [modifyPrice, setModifyPrice] = useState(false);

    const refreshData = useCallback(() => {
        if (homeId) {
            getHomeData({
                variables: getHomeById.variables(homeId),
            }).catch((error: Error) => {
                console.log(error.message);
            });
        }
    }, [homeId]);

    useEffect(() => {
        if (modifyPrice) {
            createPopup(
                <ModifyHomePrices
                    closeForm={() => {
                        setModifyPrice(false);
                        removePopup();
                    }}
                    homeId={homeData._id}
                    callback={refreshData}
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
            console.log(homeData)
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

    return (
        <>
            <div className="homepage-base">
                <div className="homepage">
                    {!loading && homeId ? (
                        <>
                            <div className="homepage__title">
                                <h1>
                                    {getTitleHome(homeData).value}
                                    {user?._id == homeData.owner._id && (
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
                                                            }, 250);
                                                        }}
                                                        user={user}
                                                        homeId={homeData._id}
                                                        callback={refreshData}
                                                        images={homeData.images}
                                                    />
                                                );
                                            }}
                                        >
                                            <i className="fi fi-rr-edit"></i>
                                        </Button>
                                    )}
                                </h1>
                                <h3>
                                    <i className="fi fi-br-users"></i>
                                    {homeData?.liveWithOwner
                                        ? 'Sống cùng chủ nhà'
                                        : 'Không sống với chủ nhà'}
                                </h3>
                            </div>
                            <div className="homepage-images">
                                <Gallery images={homeData.images} />
                                <Button
                                    variant="link"
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
                                    <i className="fi fi-sr-apps-add"></i>
                                </Button>
                            </div>
                            <div className="homepage-body">
                                <div>
                                    <div className="homepage-owner">
                                        <div className="homepage-owner__title">
                                            <h1>
                                                {'Khu trọ được cho thuê bởi chủ nhà '}
                                                <span>{homeData.owner.fullname}</span>
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
                                    <div className="homepage-description">
                                        <hr />
                                        <h1>
                                            Mô tả từ chủ nhà
                                            {user?._id == homeData.owner._id && (
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
                                                    <i className="fi fi-rr-edit"></i>
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
                                                                className="homepage-description__description"
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
                                        {user && (
                                            <div className="homezooms-add">
                                                {/*@ts-ignore */}
                                                <AddZoom homeId={homeId} user={user} />
                                            </div>
                                        )}
                                        <div className="homezooms-listlabel">Danh sách phòng</div>

                                        {listZoom?.docs && listZoom.docs.length > 0 ? (
                                            <div className="homezooms-list">
                                                {listZoom.docs.map((item, index) => (
                                                    <RoomCard
                                                        data={item}
                                                        key={index}
                                                        height="300px"
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyData text="hiện chưa có phòng nào ở đây" />
                                        )}
                                    </div>

                                    <div className="homepage-map">
                                        <hr></hr>
                                        <h2>Vị trí trọ</h2>
                                        {showMapBox && (
                                            <MapBox
                                                choosePlace={false}
                                                markerIcon={homeIcon}
                                                center={[
                                                    homeData.position.lng,
                                                    homeData.position.lat,
                                                ]}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="homepage-sprice">
                                    <div className="homepage-sprice__info">
                                        <h2>Đơn giá tháng</h2>

                                        <div>
                                            <span>{'Tiền phòng: '}</span>
                                            <br />
                                            &nbsp;&nbsp;{' ● Tối thiểu: ' + 2000000}
                                            {' VNĐ'}
                                            <br />
                                            &nbsp;&nbsp;{' ● Tối đa: ' + 4000000}
                                            {' VNĐ'}
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
                                    {user?._id == homeData.owner._id ? (
                                        <Button
                                            {...signUpBtnStyle}
                                            onClick={() => setModifyPrice(true)}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                    ) : (
                                        <Button {...signUpBtnStyle}>Thuê ngay</Button>
                                    )}
                                </div>
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
            <div className="homepage-about">
                <div>
                    <div></div>
                    <div className="homepage-about__authority">
                        <h1>Theo dõi chúng tôi</h1>
                        <div>
                            <i className="fi fi-brands-facebook"></i>Facebook
                        </div>
                        <div>
                            <i className="fi fi-brands-instagram"></i>Instagram
                        </div>
                        <div>
                            <i className="fi fi-brands-twitter"></i>Twitter
                        </div>
                    </div>
                    <div className="homepage-about__developer">
                        <h1>Developer</h1>
                        <div>Cao Trung Hiếu</div>
                        <div>Nguyễn Quốc Đại</div>
                        <div>Nguyễn Khắc Hiệp</div>
                        <div>Bùi Tuấn Anh</div>
                        <div>Nguyễn Thế Anh</div>
                    </div>
                </div>
                <hr />
                <div className="homepage-about__footer">
                    <div>
                        <Link href="/">
                            <a className="app-logo">
                                <span>Rent </span> <span>Room</span>
                            </a>
                        </Link>
                    </div>
                    <div>
                        © 2022 Website hỗ trợ tìm kiếm phòng trọ, giúp bạn tìm kiếm sự tiện nghi
                        ngay tại nhà
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
