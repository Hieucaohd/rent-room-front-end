import { useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Tooltip,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import { getHomeById } from '../../lib/apollo/home/gethomebyid';
import { RoomData, getSSRRoomById } from '../../lib/apollo/home/room/getroombyid';
import { updateRoomImages } from '../../lib/apollo/home/room/update';
import { updateHomeImages } from '../../lib/apollo/home/update';
import { deleteFile, getMetaDataFile, getPathFileFromLink } from '../../lib/upLoadAllFile';
import useResize from '../../lib/use-resize';
import useClassName from '../../lib/useClassName';
import { HomeData } from '../../pages/home/[homeid]';
import useStore from '../../store/useStore';
import NextImage from '../nextimage/image';
import styles from './style.module.scss';

export interface HomeImagePreviewProps {
    images: string[];
    homeId: string;
    close?: () => void;
    onChange?: () => void;
    owner?: string;
}

export interface RoomImagePreviewProps {
    images: string[];
    roomId: string;
    close?: () => void;
    onChange?: () => void;
    isOwner?: boolean;
}

export default function HomeImagePreivew({
    images: listImage,
    close,
    onChange,
    homeId,
    owner,
}: HomeImagePreviewProps) {
    const toast = useToast();
    const { user } = useStore((state) => ({ user: state.user.info }));
    const [updateHome, { data }] = useMutation(updateHomeImages.command, {
        update(cache, { data: { updateHome } }) {
            const data = cache.readQuery<{ getHomeById: HomeData }>({
                query: getHomeById.command,
                variables: getHomeById.variables(homeId),
            });
            if (data) {
                const newData = { ...data.getHomeById, ...updateHome };
                cache.writeQuery({
                    query: getHomeById.command,
                    variables: getHomeById.variables(homeId),
                    data: {
                        getHomeById: newData,
                    },
                });
            }
        },
        onCompleted: () => {
            onChange && onChange();
        },
    });

    const [images, setImages] = useState(listImage);

    const [className] = useClassName(styles);
    const [viewindex, setViewIndex] = useState(0);
    const [mobilemode] = useResize();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef(null);
    const [imageDeleting, setImageDeleting] = useState(false);

    const listImages = useMemo(() => {
        return images
            ? images.map((item, index) => {
                  return (
                      <motion.div
                          initial={{
                              opacity: 0,
                          }}
                          animate={{
                              opacity: 1,
                          }}
                          exit={{
                              opacity: 0,
                          }}
                          transition={{
                              duration: 0.25,
                          }}
                          key={index}
                          // drag="x"
                      >
                          <NextImage src={item} />
                      </motion.div>
                  );
              })
            : [];
    }, [images]);

    const listImagesPrev = useMemo(() => {
        return images
            ? images.map((item, index) => {
                  return (
                      <div
                          key={index}
                          onClick={() => {
                              if (viewindex != index) {
                                  setViewIndex(index);
                              }
                          }}
                          style={
                              viewindex != index
                                  ? {
                                        cursor: 'pointer',
                                    }
                                  : {}
                          }
                          {...(viewindex == index ? className('active') : {})}
                      >
                          <NextImage src={item} />
                      </div>
                  );
              })
            : [];
    }, [listImages, viewindex]);

    const btnSize = useMemo(() => {
        return mobilemode ? 30 : 42;
    }, [mobilemode]);

    const deleteImage = useCallback(
        (index: number) => {
            const imageUrl = images[index];
            const path = getPathFileFromLink(imageUrl);
            if (path) {
                deleteFile(path)
                    .then(() => {
                        console.log('deleted image');
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        },
        [images]
    );

    return (
        <div {...className('imgprev-base')}>
            <Button
                position="absolute"
                borderRadius="30px"
                width={`${btnSize}px`}
                height={`${btnSize}px`}
                top="15px"
                right={mobilemode ? '20px' : '30px'}
                onClick={() => close && close()}
                {...className('imgprev__close')}
            >
                <i className="fa-solid fa-xmark"></i>
            </Button>

            {user?._id == owner && owner && (
                <Tooltip
                    label="Số ảnh tối thiểu là 2"
                    borderRadius="3px"
                    placement="bottom"
                    isDisabled={images?.length > 2}
                    hasArrow
                >
                    <Box
                        position="absolute"
                        width={`${btnSize}px`}
                        height={`${btnSize}px`}
                        top="15px"
                        right={mobilemode ? '120px' : '170px'}
                    >
                        <Button
                            onClick={() => {
                                onOpen();
                            }}
                            borderRadius="30px"
                            width={`${btnSize}px`}
                            height={`${btnSize}px`}
                            isDisabled={images?.length <= 2}
                            {...className('imgprev__close')}
                        >
                            <i className="fa-solid fa-trash-can fa-sm"></i>
                        </Button>
                    </Box>
                </Tooltip>
            )}

            <Button
                position="absolute"
                borderRadius="30px"
                width={`${btnSize}px`}
                height={`${btnSize}px`}
                top="15px"
                right={mobilemode ? '70px' : '100px'}
                {...className('imgprev__close')}
                onClick={() => {
                    getMetaDataFile(images[viewindex]).then((res) => {
                        const fileUrl = window.URL.createObjectURL(res[0]);
                        console.log(fileUrl);
                        const a = document.createElement('a');
                        a.href = fileUrl;
                        a.download = res[1].name;
                        a.click();
                        setTimeout(() => {
                            window.URL.revokeObjectURL(fileUrl);
                        }, 60000);
                    });
                }}
            >
                <i className="fa-solid fa-download"></i>
            </Button>

            <Button
                position="absolute"
                borderRadius="30px"
                width={`${btnSize}px`}
                height={`${btnSize}px`}
                top={`calc(50%) - ${btnSize / 2}px`}
                left="10px"
                onClick={() => {
                    if (viewindex > 0) {
                        setViewIndex((prev) => prev - 1);
                    }
                }}
                {...className('imgprev__prev')}
            >
                <i className="fa-solid fa-angle-left"></i>
            </Button>
            <Button
                position="absolute"
                borderRadius="30px"
                width={`${btnSize}px`}
                height={`${btnSize}px`}
                top={`calc(50%) - ${btnSize / 2}px`}
                right="10px"
                onClick={() => {
                    if (viewindex < images.length - 1) {
                        setViewIndex((prev) => prev + 1);
                    }
                }}
                {...className('imgprev__next')}
            >
                <i className="fa-solid fa-angle-right"></i>
            </Button>
            <div {...className('imgprev')}>
                <div {...className('imgprev__image')}>
                    <AnimatePresence exitBeforeEnter>{listImages[viewindex]}</AnimatePresence>
                </div>
            </div>
            <div {...className('imgprev-listprev')}>
                <div>
                    <motion.div
                        {...className('imgprev-listprev__items')}
                        style={{
                            width: `${60 * listImagesPrev.length}px`,
                        }}
                        animate={{
                            x: -(60 * viewindex),
                        }}
                        transition={{
                            duration: 0.25,
                            type: 'spring',
                        }}
                    >
                        {listImagesPrev}
                    </motion.div>
                </div>
            </div>
            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Xóa ảnh
                        </AlertDialogHeader>

                        <AlertDialogBody>Bạn có chắc chắn muốn xóa ảnh này?</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Hủy
                            </Button>
                            <Button
                                colorScheme="red"
                                isLoading={imageDeleting}
                                onClick={() => {
                                    setImageDeleting(true);
                                    let newList = images.filter((_, index) => index != viewindex);
                                    newList ??= [];
                                    updateHome({
                                        variables: updateHomeImages.variables(newList, homeId),
                                    })
                                        .then((res) => {
                                            deleteImage(viewindex);
                                            onClose();
                                            setImageDeleting(false);
                                            setImages(res.data.updateHome.images);
                                            if (viewindex > 0) {
                                                setViewIndex((prev) => prev - 1);
                                            }
                                            toast({
                                                title: `Xóa ảnh thành công`,
                                                position: 'bottom-left',
                                                status: 'success',
                                                isClosable: true,
                                            });
                                        })
                                        .catch(() => {
                                            toast({
                                                title: `Server timeout`,
                                                description: 'Xóa ảnh thất bại',
                                                position: 'bottom-left',
                                                status: 'error',
                                                isClosable: true,
                                            });
                                            setImageDeleting(false);
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
        </div>
    );
}

export function RoomImagePreivew({
    images: roomImages,
    close,
    onChange,
    roomId,
    isOwner,
}: RoomImagePreviewProps) {
    const toast = useToast();
    const [images, setImages] = useState(roomImages);
    const [updateRoom] = useMutation(updateRoomImages.command, {
        update(cache, { data: { updateRoom } }) {
            let data;
            try {
                data = cache.readQuery<{ getRoomById: RoomData }>({
                    query: getSSRRoomById.command,
                    variables: getSSRRoomById.variables(roomId),
                });
            } catch (error) {
                console.log(error);
            }
            if (data) {
                const newData = { ...data.getRoomById, ...updateRoom };
                cache.updateQuery(
                    {
                        query: getSSRRoomById.command,
                        variables: getSSRRoomById.variables(roomId),
                    },
                    () => ({
                        getRoomById: newData,
                    })
                );
            } else {
                cache.writeQuery({
                    query: getSSRRoomById.command,
                    variables: getSSRRoomById.variables(roomId),
                    data: {
                        getRoomById: updateRoom,
                    },
                });
            }
        },
        onCompleted: () => {
            onChange && onChange();
        },
    });

    const [className] = useClassName(styles);
    const [viewindex, setViewIndex] = useState(0);
    const [mobilemode] = useResize();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef(null);
    const [imageDeleting, setImageDeleting] = useState(false);

    const listImages = useMemo(() => {
        return images
            ? images.map((item, index) => {
                  return (
                      <motion.div
                          initial={{
                              opacity: 0,
                          }}
                          animate={{
                              opacity: 1,
                          }}
                          exit={{
                              opacity: 0,
                          }}
                          transition={{
                              duration: 0.25,
                          }}
                          key={index}
                          // drag="x"
                      >
                          <NextImage src={item} />
                      </motion.div>
                  );
              })
            : [];
    }, [images]);

    const listImagesPrev = useMemo(() => {
        return images
            ? images.map((item, index) => {
                  return (
                      <div
                          key={index}
                          onClick={() => {
                              if (viewindex != index) {
                                  setViewIndex(index);
                              }
                          }}
                          style={
                              viewindex != index
                                  ? {
                                        cursor: 'pointer',
                                    }
                                  : {}
                          }
                          {...(viewindex == index ? className('active') : {})}
                      >
                          <NextImage src={item} />
                      </div>
                  );
              })
            : [];
    }, [listImages, viewindex]);

    const btnSize = useMemo(() => {
        return mobilemode ? 30 : 42;
    }, [mobilemode]);

    const deleteImage = useCallback(
        (index: number) => {
            const imageUrl = images[index];
            const path = getPathFileFromLink(imageUrl);
            if (path) {
                deleteFile(path)
                    .then(() => {
                        console.log('deleted image');
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        },
        [images]
    );

    return (
        <div {...className('imgprev-base')}>
            <Button
                position="absolute"
                borderRadius="30px"
                width={`${btnSize}px`}
                height={`${btnSize}px`}
                top="15px"
                right={mobilemode ? '20px' : '30px'}
                onClick={() => close && close()}
                {...className('imgprev__close')}
            >
                <i className="fa-solid fa-xmark"></i>
            </Button>

            {isOwner && (
                <Tooltip
                    label="Số ảnh tối thiểu là 2"
                    borderRadius="3px"
                    placement="bottom"
                    isDisabled={images?.length > 2}
                    hasArrow
                >
                    <Box
                        position="absolute"
                        width={`${btnSize}px`}
                        height={`${btnSize}px`}
                        top="15px"
                        right={mobilemode ? '120px' : '170px'}
                    >
                        <Button
                            onClick={() => {
                                onOpen();
                            }}
                            borderRadius="30px"
                            width={`${btnSize}px`}
                            height={`${btnSize}px`}
                            isDisabled={images?.length <= 2}
                            {...className('imgprev__close')}
                        >
                            <i className="fa-solid fa-trash-can fa-sm"></i>
                        </Button>
                    </Box>
                </Tooltip>
            )}

            <Button
                position="absolute"
                borderRadius="30px"
                width={`${btnSize}px`}
                height={`${btnSize}px`}
                top="15px"
                right={mobilemode ? '70px' : '100px'}
                {...className('imgprev__close')}
                onClick={() => {
                    getMetaDataFile(images[viewindex]).then((res) => {
                        const fileUrl = window.URL.createObjectURL(res[0]);
                        console.log(fileUrl);
                        const a = document.createElement('a');
                        a.href = fileUrl;
                        a.download = res[1].name;
                        a.click();
                        setTimeout(() => {
                            window.URL.revokeObjectURL(fileUrl);
                        }, 60000);
                    });
                }}
            >
                <i className="fa-solid fa-download"></i>
            </Button>

            <Button
                position="absolute"
                borderRadius="30px"
                width={`${btnSize}px`}
                height={`${btnSize}px`}
                top={`calc(50%) - ${btnSize / 2}px`}
                left="10px"
                onClick={() => {
                    if (viewindex > 0) {
                        setViewIndex((prev) => prev - 1);
                    }
                }}
                {...className('imgprev__prev')}
            >
                <i className="fa-solid fa-angle-left"></i>
            </Button>
            <Button
                position="absolute"
                borderRadius="30px"
                width={`${btnSize}px`}
                height={`${btnSize}px`}
                top={`calc(50%) - ${btnSize / 2}px`}
                right="10px"
                onClick={() => {
                    if (viewindex < images.length - 1) {
                        setViewIndex((prev) => prev + 1);
                    }
                }}
                {...className('imgprev__next')}
            >
                <i className="fa-solid fa-angle-right"></i>
            </Button>
            <div {...className('imgprev')}>
                <div {...className('imgprev__image')}>
                    <AnimatePresence exitBeforeEnter>{listImages[viewindex]}</AnimatePresence>
                </div>
            </div>
            <div {...className('imgprev-listprev')}>
                <div>
                    <motion.div
                        {...className('imgprev-listprev__items')}
                        style={{
                            width: `${60 * listImagesPrev.length}px`,
                        }}
                        animate={{
                            x: -(60 * viewindex),
                        }}
                        transition={{
                            duration: 0.25,
                            type: 'spring',
                        }}
                    >
                        {listImagesPrev}
                    </motion.div>
                </div>
            </div>
            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Xóa ảnh
                        </AlertDialogHeader>

                        <AlertDialogBody>Bạn có chắc chắn muốn xóa ảnh này?</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Hủy
                            </Button>
                            <Button
                                colorScheme="red"
                                isLoading={imageDeleting}
                                onClick={() => {
                                    setImageDeleting(true);
                                    let newList = images.filter((_, index) => index != viewindex);
                                    newList ??= [];
                                    updateRoom({
                                        variables: updateRoomImages.variables(newList, roomId),
                                    })
                                        .then((res) => {
                                            deleteImage(viewindex);
                                            onClose();
                                            setImages(res.data.updateRoom.images);
                                            setImageDeleting(false);
                                            if (viewindex > 0) {
                                                setViewIndex((prev) => prev - 1);
                                            }
                                            toast({
                                                title: `Xóa ảnh thành công`,
                                                position: 'bottom-left',
                                                status: 'success',
                                                isClosable: true,
                                            });
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            setImageDeleting(false);
                                            toast({
                                                title: `Server timeout`,
                                                description: 'Xóa ảnh thất bại',
                                                position: 'bottom-left',
                                                status: 'error',
                                                isClosable: true,
                                            });
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
        </div>
    );
}
