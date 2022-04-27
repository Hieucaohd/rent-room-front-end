import { gql, useLazyQuery } from '@apollo/client';
import { Button, Tooltip } from '@chakra-ui/react';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { signUpBtnStyle } from '../../chakra';
import AppAbout from '../../components/app-about';
import Gallery from '../../components/gallery';
import { RoomImagePreivew } from '../../components/image-preview';
import client from '../../lib/apollo/apollo-client';
import getSSRRoomById, { RoomData } from '../../lib/apollo/home/room/getroombyid';
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
    const { showImagePreview, closeImagePreview, imagePrev } = useStore((state) => ({
        imagePrev: state.imageprev,
        showImagePreview: state.setImages,
        closeImagePreview: state.closeImages,
    }));

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

    useEffect(() => {
        const callback = () => reRender()
        window.addEventListener('resize', callback)

        return () => {
            window.removeEventListener('resize', callback)
        }
    }, [])

    const refetchRoomData = useCallback(() => {
        return getRoomData();
    }, []);

    const homeLocation = useMemo(() => {
        const homeTitle = getTitleHome(homeData);
        return homeData.detailAddress
            ? homeData.detailAddress + ' ' + homeTitle.value
            : homeTitle.value;
    }, [homeData, renderState]);

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
    }, [homeData]);
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
                                    onClick={() => {}}
                                >
                                    <i className="fi fi-rr-edit"></i>
                                </Button>
                            )}
                        </h1>
                        <div className="roompage-header__detail">
                            <div>
                                <h3>
                                    <i className="fi fi-br-users"></i>
                                    {roomData.isRented ? 'Đã được cho thuê' : 'Chưa được cho thuê'}
                                </h3>
                                <h3>
                                    <i className="fi fi-rr-map-marker-home" />
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
                            variant="link"
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
                            <i className="fi fi-sr-apps-add"></i>
                        </Button>
                    </div>
                    <div className="roompage__body">
                        <div className="roompage-owner">
                            <div>
                                <h2>
                                    Phòng được cho thuê bởi chủ nhà{' '}
                                    <Link href={`#`}>
                                        <a>{homeData.owner.fullname}</a>
                                    </Link>
                                </h2>
                            </div>
                            
                        </div>
                        <div className="roompage-body"></div>
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
