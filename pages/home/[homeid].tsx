import { useLazyQuery } from '@apollo/client';
import { Avatar, Button, Skeleton, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { signUpBtnStyle } from '../../chakra';
import AddZoom from '../../components/home/addhome/addzoom';
import Gallery, { GallerySkeleton } from '../../components/gallery';
import ZoomCard, { ZoomData } from '../../components/homecard/zoomcard';
import { getHomeById } from '../../lib/apollo/home/gethomebyid';
import { getPlaceName } from '../../lib/getPosition';
import useStore from '../../store/useStore';
import ModifyHomePrices from '../../components/home/modifyhome';
import EditHomeLocation from '../../components/home/modifyhome/editLocation';
import EditDescription from '../../components/home/modifyhome/editDescription';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

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
    province: number;
    district: number;
    ward: number;
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

const Home = () => {
    const router = useRouter();
    const {
        info: user,
        setShowImagePreview,
        showedImage,
        createPopup,
        removePopup,
    } = useStore((state) => ({
        info: state.user.info,
        showedImage: !!state.imageprev?.images,
        setShowImagePreview: state.setImages,
        createPopup: state.createPopup,
        removePopup: state.removePopup,
    }));
    const { homeid } = router.query;
    const [getHomeData, { data, loading: loadingData }] = useLazyQuery(getHomeById.command);

    const homeData: HomeData = getData(data);
    const [homeDescription, setHomeDescription] = useState<
        {
            key: string;
            des: string;
        }[]
    >([]);
    const [showMoreDes, setShowMoreDes] = useState(false); // state quản lý hiển thị thêm mô tả trọ
    const listZoom: ListZoomData = getListZoom(data);
    const [province, setProvince] = useState<string>('');
    const [district, setDistrict] = useState<string>('');
    const [ward, setWard] = useState<string>('');
    const [loading, setLoading] = useState(true);

    //state form
    const [modifyPrice, setModifyPrice] = useState(false);

    useEffect(() => {
        if (homeid) {
            getHomeData({
                variables: getHomeById.variables(homeid?.toString()!),
            }).catch((error: Error) => {
                console.log(error.message);
            });
        }
    }, [homeid]);

    const refreshData = useCallback(() => {
        if (homeid) {
            getHomeData({
                variables: getHomeById.variables(homeid?.toString()!),
            }).catch((error: Error) => {
                console.log(error.message);
            });
        }
    }, [homeid]);

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
            getPlaceName(homeData.province, homeData.district, homeData.ward).then((data) => {
                const [p, d, w] = data;
                setProvince(p.replace('Thành phố ', '').replace('Tỉnh ', ''));
                setDistrict(d);
                setWard(w);
                setLoading(false);
            });
            const dataDes = JSON.parse(homeData.description);
            setHomeDescription(dataDes);
        }
    }, [homeData]);

    useEffect(() => {
        if (homeData && showedImage && homeid) {
            setShowImagePreview({
                images: homeData.images,
                homeId: homeid.toString(),
                owner: homeData.owner._id,
                onChange: () => {
                    getHomeData({
                        variables: getHomeById.variables(homeid?.toString()!),
                    }).catch((error: Error) => {
                        console.log(error.message);
                    });
                },
            });
        }
    }, [homeData?.images, showedImage, homeid]);

    console.log(homeDescription);

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

    return (
        <>
            <div className="homepage-base">
                <div className="homepage">
                    {!loading && homeid ? (
                        <>
                            <div className="homepage__title">
                                <h1>
                                    {ward + ', ' + district + ', ' + province}
                                    {user?._id == homeData.owner._id && (
                                        <Button
                                            variant="link"
                                            _focus={{
                                                boxShadow: 'none',
                                            }}
                                            onClick={() => {
                                                createPopup(
                                                    <EditHomeLocation
                                                        closeForm={() => {
                                                            removePopup();
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
                                        setShowImagePreview({
                                            images: homeData.images,
                                            homeId: homeid.toString(),
                                            owner: homeData.owner._id,
                                            onChange: () => {
                                                getHomeData({
                                                    variables: getHomeById.variables(
                                                        homeid?.toString()!
                                                    ),
                                                }).catch((error: Error) => {
                                                    console.log(error.message);
                                                });
                                            },
                                        });
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
                                    <div className="homepage-about">
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
                                        <div className="homepage-about__description">
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
                                                                className="homepage-about__description"
                                                            >
                                                                {renderDescription[1]}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            ) : (
                                                <div className="homepage-about__empty">
                                                    <i className="fi fi-br-browser"></i>
                                                    chưa có dữ liệu
                                                </div>
                                            )}
                                        </div>
                                        {homeData.description && (
                                            <Button
                                                className="homepage-about__showmore"
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
                                                <AddZoom homeId={homeid} user={user} />
                                            </div>
                                        )}
                                        <div className="homezooms-listlabel">Danh sách phòng</div>
                                        <div className="homezooms-list">
                                            {listZoom?.docs &&
                                                listZoom.docs.map((item, index) => (
                                                    <ZoomCard data={item} key={index} />
                                                ))}
                                        </div>
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
                                    <div className="homepage-about"></div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
