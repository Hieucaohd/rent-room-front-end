import { gql, useLazyQuery } from '@apollo/client';
import { Button } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import AppAbout from '../../components/app-about';
import Gallery from '../../components/gallery';
import HomeImagePreivew, { RoomImagePreivew } from '../../components/image-preview';
import client from '../../lib/apollo/apollo-client';
import getSSRRoomById, { RoomData } from '../../lib/apollo/home/room/getroombyid';
import getTitleHome from '../../lib/getNameHome';
import getSecurityCookie from '../../security';
import useStore from '../../store/useStore';

export interface ZoomData {}

export interface RoomPageProps {
    roomSSRData: RoomData;
    roomId: string;
    isOwner: boolean;
}

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
    const [roomDataChange, setRoomDataChange] = useState(false);
    const [roomData, setRoomData] = useState(roomSSRData);
    const homeData = roomData.home;
    const { showImagePreview, closeImagePreview, imagePrev } = useStore((state) => ({
        imagePrev: state.imageprev,
        showImagePreview: state.setImages,
        closeImagePreview: state.closeImages,
    }));

    const refetchRoomData = useCallback(() => {
        return getRoomData();
    }, []);

    const roomTitle = useMemo(() => {
        const homeTitle = getTitleHome(homeData);
        if (homeTitle.isTitle) {
            return 'Phòng ' + roomData.roomNumber + ' ' + homeTitle.value;
        } else {
            return 'Phòng ' + roomData.roomNumber + ' gần ' + homeTitle.value;
        }
    }, [homeData]);
    return (
        <>
            <div className="roompage-base">
                <div className="roompage__header">
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
                    <h3>
                        <i className="fi fi-br-users"></i>
                        {homeData.liveWithOwner ? 'Sống cùng chủ nhà' : 'Không sống với chủ nhà'}
                    </h3>
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
                <div className="roompage-body"></div>
            </div>
            <AppAbout />
        </>
    );
}

export default memo(Room);
