import { gql, useLazyQuery, useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Avatar,
    Button,
    Heading,
    Tooltip,
    useDisclosure,
} from '@chakra-ui/react';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { AnimatePresence, motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signUpBtnStyle } from '../../chakra';
import AppAbout from '../../components/app-about';
import EmptyData from '../../components/emptydata';
import Gallery from '../../components/gallery';
import {
    EditRoomAmenity,
    EditRoomDescription,
    EditRoomTitle,
} from '../../components/home/modifyRoom';
import { RoomImagePreivew } from '../../components/image-preview';
import MapBox from '../../components/mapbox';
import listAmenityIcon from '../../lib/amenities';
import client from '../../lib/apollo/apollo-client';
import { Amenity, deleteRoomById } from '../../lib/apollo/home/room';
import { getSSRRoomById, RoomData } from '../../lib/apollo/home/room/getroombyid';
import getTitleHome from '../../lib/getNameHome';
import { deleteAllFile, getPathFileFromLink } from '../../lib/upLoadAllFile';
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

    const { isOpen: isOpenDialog, onOpen: onOpenDialog, onClose: onCloseDialog } = useDisclosure();
    const cancelDeleteRef = useRef(null);
    const [listPath, setListPath] = useState<(string | null)[]>([]);

    useEffect(() => {
        const paths = roomData.images.map((item) => {
            return getPathFileFromLink(item);
        });
        if (paths) {
            setListPath(paths);
        }
    }, [roomData]);

    const [roomDeleting, setRoomDeleting] = useState(false);
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

    const [deleteRoom] = useMutation(deleteRoomById.command, {
        variables: deleteRoomById.variables(roomId),
    });

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
                            {isOwner && (
                                <Button
                                    variant="link"
                                    _focus={{
                                        boxShadow: 'none',
                                    }}
                                    onClick={() => {
                                        if (user) {
                                            createPopup(
                                                <EditRoomTitle
                                                    roomId={roomData._id}
                                                    closeForm={closePopup}
                                                    callback={refetchRoomData}
                                                    userId={user._id}
                                                    images={roomData.images}
                                                />
                                            );
                                        }
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
                                    isDisabled={!roomData.isRented || isOwner}
                                    placement={!mobilemode ? 'bottom' : 'top'}
                                    hasArrow
                                >
                                    <div>
                                        {!isOwner ? (
                                            <Button {...payBtnStyle}>Liên hệ chủ nhà</Button>
                                        ) : (
                                            <Button
                                                isLoading={roomDeleting}
                                                width={'100%'}
                                                colorScheme="red"
                                                onClick={() => {
                                                    onOpenDialog();
                                                }}
                                            >
                                                Xóa phòng
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
                                    <div className="roompage-property">
                                        {homeData?.electricityPrice && (
                                            <div>
                                                <i className="fa-solid fa-bolt"></i>
                                                Tiền điện: {homeData.electricityPrice} VNĐ/tháng
                                            </div>
                                        )}
                                        {homeData?.waterPrice && (
                                            <div>
                                                <i className="fa-solid fa-faucet-drip"></i>
                                                Tiền nước: {homeData.waterPrice} VNĐ/tháng
                                            </div>
                                        )}
                                        {homeData?.cleaningPrice && (
                                            <div>
                                                <i className="fa-solid fa-spray-can-sparkles"></i>
                                                Tiền dọn dẹp: {homeData.cleaningPrice} VNĐ/tháng
                                            </div>
                                        )}
                                        {homeData?.internetPrice && (
                                            <div>
                                                <i className="fa-solid fa-wifi"></i>
                                                Tiền mạng: {homeData.internetPrice} VNĐ/tháng
                                            </div>
                                        )}
                                        {roomData.floor && (
                                            <div>
                                                <i className="fa-solid fa-arrow-right-to-city"></i>
                                                Tầng số {roomData.floor}
                                            </div>
                                        )}
                                        {roomData.square && (
                                            <div className="roompage-property__square">
                                                <i className="fa-solid fa-vector-square"></i>
                                                <div>
                                                    Diện tích: {roomData.square} m<div>2</div>
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
                                    Mô tả từ chủ nhà
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
                                        <EmptyData text="hiện chưa có mô tả thêm từ chủ trọ" />
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
                                        {showMoreDes ? 'Thu gọn' : 'Hiển thị thêm'}
                                    </Button>
                                )}
                                <hr />
                            </div>
                            <div className="roompage-amenities">
                                <div className="roompage-amenities__title">
                                    <h2>Tiện ích phòng</h2>
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
                                        <i className="fa-solid fa-plus"></i>Thêm tiện ích
                                    </Button>
                                </div>
                                <div>
                                    {renderAmenities.length != 0 ? (
                                        renderAmenities
                                    ) : (
                                        <EmptyData text="Chưa có tiện ích nào được thêm" />
                                    )}
                                </div>
                                <hr />
                            </div>
                        </div>
                        <div className="roompage__map">
                            <h2>Vị trí phòng</h2>
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
            <AlertDialog
                isOpen={isOpenDialog}
                leastDestructiveRef={cancelDeleteRef}
                onClose={onCloseDialog}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Xóa phòng
                        </AlertDialogHeader>

                        <AlertDialogBody>Bạn có chắc chắn muốn xóa phòng này?</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelDeleteRef} onClick={onCloseDialog}>
                                Hủy
                            </Button>
                            <Button
                                colorScheme="red"
                                isLoading={roomDeleting}
                                onClick={() => {
                                    setRoomDeleting(true);
                                    deleteRoom().then(async () => {
                                        await deleteAllFile(listPath);
                                        window.location.href = `/home/${homeData._id}`;
                                    });
                                }}
                                ml={3}
                            >
                                Xóa
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}

export default memo(Room);
