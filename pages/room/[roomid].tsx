import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Avatar, Button, Tooltip } from '@chakra-ui/react';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { AnimatePresence, motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { signUpBtnStyle } from '@chakra';
import AppAbout from '@components/app-about';
import EmptyData from '@components/emptydata';
import Gallery from '@components/gallery';
import {
    DeleteRoom,
    EditRoomAmenity,
    EditRoomDescription,
    EditRoomTitle,
} from '@components/home/modifyRoom';
import { RoomImagePreivew } from '@components/image-preview';
import MapBox from '@components/mapbox';
import listAmenityIcon from '@lib/amenities';
import client from '@lib/apollo/apollo-client';
import { Amenity, deleteRoomById } from '@lib/apollo/home/room';
import { getSSRRoomById } from '@lib/apollo/home/room/getroombyid';
import { getRoomSaved, saveRoom, updateRoom as updateRoomSaved } from '@lib/apollo/profile';
import getTitleHome from '@lib/getNameHome';
import useResize from '@lib/use-resize';
import getSecurityCookie from '@security';
import useStore from '@store/useStore';
import { RoomData } from '@lib/interface';
import { formatPrice1 } from '@lib/formatPrice';

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
                fetchPolicy: 'no-cache',
            });
            const roomData = getRoomDataFromQuery(data2);
            if (roomData) {
                return {
                    props: {
                        roomSSRData: roomData,
                        roomId: roomId.toString(),
                        isOwner: user?._id == roomData?.home?.owner?._id,
                    },
                };
            } else {
                return {
                    notFound: true,
                };
            }
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

function Room({ roomSSRData, roomId, isOwner }: RoomPageProps) {
    const router = useRouter();
    const [getRoomData, { data }] = useLazyQuery(getSSRRoomById.command, {
        variables: getSSRRoomById.variables(roomId),
        onCompleted: (data) => {
            const newData = getRoomDataFromQuery(data);
            setRoomData({ ...roomSSRData, ...newData });
        },
    });
    const [roomData, setRoomData] = useState(roomSSRData);
    const homeData = roomData.home;

    const { user, isServerSide, showImagePreview, closeImagePreview, createPopup, closePopup } =
        useStore((state) => ({
            user: state.user.info,
            isServerSide: state.user.SSR,
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
            // console.log(barHeight);
            if (barHeight) {
                return barHeight.clientHeight;
            }
            return 56;
        }
        return 0;
    }, [mobilemode, renderState]);

    const isSavedRoom = useMemo(() => {
        if (!isOwner && !isServerSide && user) {
            const data = getRoomSaved(user._id);
            if (data) {
                if (data.includes(roomId)) {
                    return true;
                }
                return false;
            }
        }
        return false;
    }, [isServerSide, homeData, renderState]);

    //description
    useEffect(() => {
        if (roomData) {
            // console.log(roomData);
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
            homeData.districtName.replace('Qu???n ', '').replace('Huy???n ', '') +
            ', ' +
            homeData.provinceName.replace('Th??nh ph??? ', '').replace('T???nh ', '')
        );
    }, [homeData]);

    const roomTitle: ReactJSXElement = useMemo(() => {
        const homeTitle = getTitleHome(homeData);
        if (homeTitle.isTitle) {
            return (
                <>
                    Ph??ng {roomData.roomNumber}{' '}
                    <Link href={`/home/${homeData._id}`}>
                        <a>{homeTitle.value}</a>
                    </Link>
                </>
            );
        } else {
            return (
                <>
                    Ph??ng {roomData.roomNumber},{' '}
                    <Link href={`/home/${homeData._id}`}>
                        <a>{homeTitle.value}</a>
                    </Link>
                </>
            );
        }
    }, [data, roomData]);

    const listAmenity: Amenity[] = useMemo(() => {
        if (roomData) {
            return roomData.amenities.map((item, value) => {
                return {
                    title: item.title,
                };
            });
        }
        return [];
    }, [roomData]);

    const renderAmenities = useMemo(() => {
        return (
            roomData &&
            roomData.amenities.map((item, index) => {
                const val = listAmenityIcon[parseInt(item.title)];
                return (
                    <div key={index}>
                        <h1>{val.icon}</h1>
                        <p>{val.des}</p>
                    </div>
                );
            })
        );
    }, [roomData]);

    return (
        <>
            <div className="roompage-base">
                <div className="roompage">
                    <div className="roompage-header">
                        <h1>
                            {roomTitle}
                            {isOwner ? (
                                <Button
                                    variant="link"
                                    _focus={{
                                        boxShadow: 'none',
                                    }}
                                    onClick={() => {
                                        if (user) {
                                            createPopup(
                                                //@ts-ignore
                                                <EditRoomTitle
                                                    {...roomData}
                                                    closeForm={closePopup}
                                                    callback={refetchRoomData}
                                                    userId={user._id}
                                                />
                                            );
                                        }
                                    }}
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </Button>
                            ) : (
                                (user?.userType == 'TENANT' || !user) && (
                                    <Button
                                        variant="link"
                                        _focus={{
                                            boxShadow: 'none',
                                        }}
                                        marginLeft="10px"
                                        color="var(--app-color)"
                                        height="100%"
                                        gap="5px"
                                        onClick={() => {
                                            if (user) {
                                                if (!isSavedRoom) {
                                                    if (
                                                        confirm(
                                                            'B???n c?? ch???c ch???n mu???n l??u ph??ng n??y?'
                                                        )
                                                    ) {
                                                        saveRoom(user._id, roomId);
                                                        reRender();
                                                    }
                                                } else {
                                                    if (
                                                        confirm(
                                                            'B???n c?? ch???c ch???n mu???n b??? l??u ph??ng n??y?'
                                                        )
                                                    ) {
                                                        const listSaved = getRoomSaved(user._id);
                                                        const newList = listSaved.filter(
                                                            (item) => item != roomId
                                                        );
                                                        updateRoomSaved(user._id, newList);
                                                        reRender();
                                                    }
                                                }
                                            } else {
                                                if (
                                                    confirm(
                                                        'B???n ph???i ????ng nh???p ????? th???c hi???n thao t??c n??y!'
                                                    )
                                                ) {
                                                    router.push('/signin');
                                                }
                                            }
                                        }}
                                    >
                                        {isSavedRoom ? (
                                            <>
                                                <i className="fa-solid fa-heart"></i>???? l??u
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-regular fa-heart"></i>L??u l???i
                                            </>
                                        )}
                                    </Button>
                                )
                            )}
                        </h1>
                        <div className="roompage-header__detail">
                            <div>
                                <h3>
                                    {roomData.isRented ? (
                                        <>
                                            <i className="fa-solid fa-check"></i>???? ???????c cho thu??
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-user-group"></i>Ch??a ???????c cho
                                            thu??
                                        </>
                                    )}
                                </h3>
                                <h3>
                                    <i className="fa-solid fa-location-dot"></i>
                                    {homeLocation}
                                </h3>
                            </div>
                            <div>
                                <span>{formatPrice1(roomData.price)} ??/th??ng</span>
                                <Tooltip
                                    label="Ph??ng ???? ???????c cho thu??"
                                    borderRadius="3px"
                                    isDisabled={!roomData.isRented || isOwner}
                                    placement={!mobilemode ? 'bottom' : 'top'}
                                    hasArrow
                                >
                                    <div>
                                        {!isOwner ? (
                                            <Button {...payBtnStyle}>
                                                <a href={`tel:${homeData.owner.numberPhone}`}>
                                                    <i className="fa-solid fa-phone-flip"></i>
                                                    {homeData.owner.numberPhone}
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button
                                                width={'100%'}
                                                colorScheme="red"
                                                onClick={() => {
                                                    createPopup(
                                                        <DeleteRoom
                                                            closeForm={closePopup}
                                                            roomData={roomData}
                                                        />
                                                    );
                                                }}
                                            >
                                                X??a ph??ng
                                            </Button>
                                        )}
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
                            Xem t???t c???
                        </Button>
                    </div>
                    <div className="roompage__body">
                        <div>
                            <div className="roompage-owner">
                                <div>
                                    <h2>
                                        Ph??ng ???????c cho thu?? b???i ch??? nh??{' '}
                                        <Link href={`/profile/${homeData.owner._id}`}>
                                            <a>{homeData.owner.fullname}</a>
                                        </Link>
                                    </h2>
                                    <div className="roompage-property">
                                        {homeData?.electricityPrice && (
                                            <div>
                                                <i className="fa-solid fa-bolt"></i>
                                                Ti???n ??i???n: {formatPrice1(
                                                    homeData.electricityPrice
                                                )}{' '}
                                                VN??/th??ng
                                            </div>
                                        )}
                                        {homeData?.waterPrice && (
                                            <div>
                                                <i className="fa-solid fa-faucet-drip"></i>
                                                Ti???n n?????c: {formatPrice1(homeData.waterPrice)}{' '}
                                                VN??/th??ng
                                            </div>
                                        )}
                                        {homeData?.cleaningPrice && (
                                            <div>
                                                <i className="fa-solid fa-spray-can-sparkles"></i>
                                                Ti???n d???n d???p: {formatPrice1(
                                                    homeData.cleaningPrice
                                                )}{' '}
                                                VN??/th??ng
                                            </div>
                                        )}
                                        {homeData?.internetPrice && (
                                            <div>
                                                <i className="fa-solid fa-wifi"></i>
                                                Ti???n m???ng: {formatPrice1(
                                                    homeData.internetPrice
                                                )}{' '}
                                                VN??/th??ng
                                            </div>
                                        )}
                                        {roomData.floor && (
                                            <div>
                                                <i className="fa-solid fa-arrow-right-to-city"></i>
                                                T???ng s??? {roomData.floor}
                                            </div>
                                        )}
                                        {roomData.square && (
                                            <div className="roompage-property__square">
                                                <i className="fa-solid fa-vector-square"></i>
                                                <div>
                                                    Di???n t??ch: {roomData.square} m<div>2</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                    M?? t??? t??? ch??? nh??
                                    {isOwner && (
                                        <Button
                                            variant="link"
                                            _focus={{
                                                boxShadow: 'none',
                                            }}
                                            onClick={() => {
                                                createPopup(
                                                    <EditRoomDescription
                                                        closeForm={() => {
                                                            closePopup();
                                                        }}
                                                        roomId={roomId}
                                                        callback={refetchRoomData}
                                                        defautDes={roomDescription}
                                                    />
                                                );
                                            }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </Button>
                                    )}
                                </h1>

                                <div className="homepage-description__description">
                                    {roomData.description ? (
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
                                        <EmptyData text="hi???n ch??a c?? m?? t??? th??m t??? ch??? tr???" />
                                    )}
                                </div>
                                {roomData.description && (
                                    <Button
                                        className="homepage-description__showmore"
                                        variant="link"
                                        onClick={() => {
                                            setShowMoreDes((prev) => !prev);
                                        }}
                                    >
                                        {showMoreDes ? 'Thu g???n' : 'Hi???n th??? th??m'}
                                    </Button>
                                )}
                                <hr />
                            </div>
                            <div
                                className={`roompage-amenities${
                                    renderAmenities.length == 0 ? ' roompage-amenities--empty' : ''
                                }`}
                            >
                                <div className="roompage-amenities__title">
                                    <h2>Ti???n ??ch ph??ng</h2>
                                    {isOwner && (
                                        <Button
                                            gap="5px"
                                            onClick={() => {
                                                createPopup(
                                                    <EditRoomAmenity
                                                        key={JSON.stringify(listAmenity)}
                                                        roomId={roomData._id}
                                                        closeForm={closePopup}
                                                        callback={refetchRoomData}
                                                        amenities={listAmenity}
                                                    />
                                                );
                                            }}
                                        >
                                            <i className="fa-solid fa-plus"></i>Th??m ti???n ??ch
                                        </Button>
                                    )}
                                </div>
                                <div>
                                    {renderAmenities.length != 0 ? (
                                        renderAmenities
                                    ) : (
                                        <EmptyData text="Ch??a c?? ti???n ??ch n??o ???????c th??m" />
                                    )}
                                </div>
                                <hr />
                            </div>
                        </div>
                        <div className="roompage__map">
                            <h2>V??? tr?? ph??ng</h2>
                            {
                                <MapBox
                                    choosePlace={false}
                                    {...(homeData?.position
                                        ? { center: [homeData.position.lng, homeData.position.lat] }
                                        : {})}
                                />
                            }
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
