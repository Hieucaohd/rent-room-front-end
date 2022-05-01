import { gql, useLazyQuery } from '@apollo/client';
import { Avatar, Button, Tooltip } from '@chakra-ui/react';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { AnimatePresence, motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { signUpBtnStyle } from '../../chakra';
import AppAbout from '../../components/app-about';
import EmptyData from '../../components/emptydata';
import Gallery from '../../components/gallery';
import { EditRoomTitle } from '../../components/home/modifyRoom';
import { RoomImagePreivew } from '../../components/image-preview';
import client from '../../lib/apollo/apollo-client';
import { getSSRRoomById, RoomData } from '../../lib/apollo/home/room/getroombyid';
import getTitleHome from '../../lib/getNameHome';
import useResize from '../../lib/use-resize';
import getSecurityCookie from '../../security';
import useStore from '../../store/useStore';

export interface ZoomData {}

export interface RoomPageProps {
    roomSSRData: RoomData;
    roomId: string;
    isOwner: boolean;
}

const payBtnStyle = { ...signUpBtnStyle, height: undefined, fontWeight: 700 };

const getRoomDataFromQuery = (data: any) => data.getRoomById;

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const Cookie = getSecurityCookie(req);
    let user: { _id: string } | null = null;
    const { roomid: roomId } = query;
    if (roomId) {
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
                query: getSSRRoomById.command,
                variables: getSSRRoomById.variables(roomId.toString()),
            });
            const roomData = getRoomDataFromQuery(data2);
            return {
                props: {
                    roomSSRData: roomData,
                    roomId: roomId.toString(),
                    isOwner: user?._id == roomData?.home?.owner?._id,
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

function Room({ roomSSRData, roomId, isOwner }: RoomPageProps) {
    const [getRoomData, { data }] = useLazyQuery(getSSRRoomById.command, {
        variables: getSSRRoomById.variables(roomId),
        onCompleted: (data) => {
            const newData = getRoomDataFromQuery(data);
            setRoomData(newData);
        },
    });

    const [roomData, setRoomData] = useState(roomSSRData);
    const homeData = roomData.home;
    const { showImagePreview, closeImagePreview, createPopup, closePopup } = useStore((state) => ({
        imagePrev: state.imageprev,
        showImagePreview: state.setImages,
        closeImagePreview: state.closeImages,
        createPopup: state.createPopup,
        closePopup: state.removePopup,
    }));

    const [roomDescription, setRoomDescription] = useState<
        {
            key: string;
            des: string;
        }[]
    >();
    const [showMoreDes, setShowMoreDes] = useState(false);

    const [mobilemode, renderState, reRender] = useResize(600);
    const aboutpageMarginBottom = useMemo(() => {
        if (mobilemode) {
            const barHeight = document.querySelector(
                '.roompage-header__detail > div:nth-of-type(2)'
            );
            console.log(barHeight);
            if (barHeight) {
                return barHeight.clientHeight;
            }
            return 56;
        }
        return 0;
    }, [mobilemode, renderState]);

    //description
    useEffect(() => {
        if (roomData) {
            console.log(roomData);
            const dataDes = JSON.parse(roomData.description);
            setRoomDescription(dataDes);
        }
    }, [roomData]);

    const renderDescription = useMemo(() => {
        if (!roomDescription || roomDescription.length == 0) {
            return null;
        }
        let limit = 0;
        if (roomDescription[0].des == '') {
            limit = 1;
        }
        return [
            roomDescription.map((item, index) => {
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
            roomDescription.map((item, index) => {
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
    }, [roomDescription, showMoreDes]);

    useEffect(() => {
        const callback = () => reRender();
        window.addEventListener('resize', callback);

        return () => {
            window.removeEventListener('resize', callback);
        };
    }, []);

    const refetchRoomData = useCallback(() => {
        return getRoomData();
    }, []);

    const homeLocation = useMemo(() => {
        return (
            homeData.wardName +
            ', ' +
            homeData.districtName.replace('Quận ', '').replace('Huyện ', '') +
            ', ' +
            homeData.provinceName.replace('Thành phố ', '').replace('Tỉnh ', '')
        );
    }, [homeData]);

    const roomTitle: ReactJSXElement = useMemo(() => {
        const homeTitle = getTitleHome(homeData);
        if (homeTitle.isTitle) {
            return (
                <>
                    Phòng {roomData.roomNumber}{' '}
                    <Link href={`/home/${homeData._id}`}>
                        <a>{homeTitle.value}</a>
                    </Link>
                </>
            );
        } else {
            return (
                <>
                    Phòng {roomData.roomNumber} gần{' '}
                    <Link href={`/home/${homeData._id}`}>
                        <a>{homeTitle.value}</a>
                    </Link>
                </>
            );
        }
    }, [data]);
    return (
        <>
            <div className="roompage-base">
                <div className="roompage">
                    <div className="roompage-header">
                        <h1>
                            {roomTitle}
                            {isOwner && (
                                <Button
                                    variant="link"
                                    _focus={{
                                        boxShadow: 'none',
                                    }}
                                    onClick={() => {
                                        createPopup(
                                            <EditRoomTitle
                                                roomId={roomData._id}
                                                closeForm={closePopup}
                                                callback={refetchRoomData}
                                            />
                                        );
                                    }}
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </Button>
                            )}
                        </h1>
                        <div className="roompage-header__detail">
                            <div>
                                <h3>
                                    {roomData.isRented ? (
                                        <>
                                            <i className="fa-solid fa-check"></i>Đã được cho thuê
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-user-group"></i>Chưa được cho
                                            thuê
                                        </>
                                    )}
                                </h3>
                                <h3>
                                    <i className="fa-solid fa-location-dot"></i>
                                    {homeLocation}
                                </h3>
                            </div>
                            <div>
                                <span>{roomData.price} đ/tháng</span>
                                <Tooltip
                                    label="Phòng đã được cho thuê"
                                    borderRadius="3px"
                                    isDisabled={!roomData.isRented}
                                    placement={!mobilemode ? 'bottom' : 'top'}
                                    hasArrow
                                >
                                    <div>
                                        <Button {...payBtnStyle}>Liên hệ chủ nhà</Button>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div className="roompage__gallery">
                        <Gallery images={roomData.images} />
                        <Button
                            display="flex"
                            gap="5px"
                            bgColor="white"
                            color="black"
                            opacity={0.9}
                            onClick={() => {
                                showImagePreview(
                                    <RoomImagePreivew
                                        key={roomId}
                                        images={roomData.images}
                                        roomId={roomId}
                                        isOwner={isOwner}
                                        onChange={refetchRoomData}
                                        close={closeImagePreview}
                                    />
                                );
                            }}
                        >
                            <i className="fa-solid fa-border-all"></i>
                            Xem tất cả
                        </Button>
                    </div>
                    <div className="roompage__body">
                        <div>
                            <div className="roompage-owner">
                                <div>
                                    <h2>
                                        Phòng được cho thuê bởi chủ nhà{' '}
                                        <Link href={`#`}>
                                            <a>{homeData.owner.fullname}</a>
                                        </Link>
                                    </h2>
                                </div>
                                <div>
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
                                    {isOwner && (
                                        <Button
                                            variant="link"
                                            _focus={{
                                                boxShadow: 'none',
                                            }}
                                            onClick={() => {
                                                /* createPopup(
                                                <EditDescription
                                                    closeForm={() => {
                                                        removePopup();
                                                    }}
                                                    homeId={homeData._id}
                                                    callback={refreshData}
                                                    defautDes={homeDescription}
                                                />
                                            ); */
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
                        </div>
                    </div>
                </div>
            </div>
            <AppAbout
                style={{
                    marginBottom: aboutpageMarginBottom,
                }}
            />
        </>
    );
}

export default memo(Room);
