import { useLazyQuery } from '@apollo/client';
import { Avatar, Box, Button, Skeleton } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { signUpBtnStyle } from '../../chakra';
import AddZoom from '../../components/addhome/addzoom';
import ZoomCard, { ZoomData } from '../../components/homecard/zoomcard';
import NextImage from '../../components/nextimage/image';
import { getHomeById } from '../../lib/apollo/home/gethomebyid';
import { getPlaceName } from '../../lib/getPosition';
import useStore from '../../store/useStore';

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
    position: {
        lng: number;
        lat: number;
    };
    listRooms: ListZoomData;
}

const getData = (data: any) => {
    const dt = data?.getHomeById;
    return dt;
};

const getListZoom = (data: any) => {
    const dt = data?.getHomeById?.listRooms;
    return dt;
};

const Home = () => {
    const router = useRouter();
    const { info: user } = useStore((state) => state.user);
    const { homeid } = router.query;
    const [getHomeData, { data, loading: loadingData }] = useLazyQuery(getHomeById.command);

    const homeData: HomeData = getData(data);
    const listZoom: ListZoomData = getListZoom(data);
    const [province, setProvince] = useState<string>('');
    const [district, setDistrict] = useState<string>('');
    const [ward, setWard] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (homeid) {
            getHomeData({
            variables: getHomeById.variables(homeid?.toString()!),
        }).catch((error: Error) => {
            console.log(error.message);
        });
        }
    }, [homeid]);

    useEffect(() => {
        if (homeData) {
            console.log(homeData);
            getPlaceName(homeData.province, homeData.district, homeData.ward).then((data) => {
                const [p, d, w] = data;
                setProvince(p.replace('Thành phố ', '').replace('Tỉnh ', ''));
                setDistrict(d);
                setWard(w);
                setLoading(false);
            });
        }
    }, [homeData]);

    return (
        <div className="homepage-base">
            <div className="homepage">
                {!loading && homeid ? (
                    <>
                        <div className="homepage__title">
                            <h1>{ward + ', ' + district + ', ' + province}</h1>
                            <h3>
                                <i className="fi fi-br-users"></i>
                                {homeData?.liveWithOwner
                                    ? 'Sống cùng chủ nhà'
                                    : 'Không sống với chủ nhà'}
                            </h3>
                        </div>
                        <div className="homepage-images">
                            <div className="homepage-images__left">
                                <NextImage src={homeData.images[0]} />
                            </div>
                            <div className="homepage-images__center">
                                <NextImage src={homeData.images[1]} />
                                <NextImage src={homeData.images[2]} />
                            </div>
                            <div className="homepage-images__right">
                                <NextImage src={homeData.images[3]} />
                                <NextImage src={homeData.images[4]} />
                            </div>
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
                                <div className="homepage-about"></div>
                                <div className="homerooms">
                                    {/* show zoom */}
                                    {user && (
                                        <div className="homezooms-add">
                                            {/*@ts-ignore */}
                                            <AddZoom homeId={homeid} user={user} />
                                        </div>
                                    )}
                                    <div>Danh sách phòng</div>
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
                                </div>
                                {user?._id == homeData.owner._id ? (
                                    <Button {...signUpBtnStyle}>Chỉnh sửa</Button>
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
                            <div className="homepage-images__left">
                                <Skeleton />
                            </div>
                            <div className="homepage-images__center">
                                <Skeleton />
                                <Skeleton />
                            </div>
                            <div className="homepage-images__right">
                                <Skeleton />
                                <Skeleton />
                            </div>
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
                                            <Skeleton height="20px" width="30%" marginTop="10px" />
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
    );
};

export default Home;
