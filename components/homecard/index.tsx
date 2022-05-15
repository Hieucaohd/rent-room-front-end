import { useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { deleteHome } from '@lib/apollo/home';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';
import { motion } from 'framer-motion';
import Slider from '@components/Slider';
import Link from 'next/link';

export interface HomeCardProps {
    _id: string;
    province?: any;
    district?: any;
    ward?: any;
    provinceName: string;
    districtName: string;
    wardName: string;
    liveWithOwner?: Boolean;
    electricityPrice?: number;
    waterPrice?: number;
    images: string[];
    totalRooms?: number;
    title: string;
    __typename?: any;
    afterDelete?: () => any;
    removeAble?: boolean;
}

export default function HomeCard(props: HomeCardProps) {
    const removeAble = props.removeAble ?? true;
    const mount = useRef(false);
    const toast = useToast();
    const [deleteCurrentHome] = useMutation(deleteHome.command, {
        variables: deleteHome.variable(props._id),
    });
    const [listPath, setListPath] = useState<(string | null)[]>([]);
    const { isOpen: isOpenDialog, onOpen: onOpenDialog, onClose: onCloseDialog } = useDisclosure();
    const cancelDeleteRef = useRef(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    useEffect(() => {
        mount.current = true;

        return () => {
            mount.current = false;
        };
    });

    useEffect(() => {
        const paths = props.images.map((item) => {
            return getPathFileFromLink(item);
        });
        if (paths && mount.current) {
            setListPath(paths);
        }
    }, [props.images]);

    const homeTitle = useMemo(() => {
        if (props.title) {
            return props.title;
        }
        return (
            props.wardName +
            ', ' +
            props.districtName.replace('Quận ', '').replace('Huyện ', '') +
            ', ' +
            props.provinceName.replace('Thành phố ', '').replace('Tỉnh ', '')
        );
    }, [props]);

    return (
        <>
            <motion.div className={`homecard`}>
                <div className="homecard__imgslider">
                    <Slider
                        href={`/home/${props._id}`}
                        images={props.images}
                        width="100%"
                        height="280px"
                    />
                </div>
                <div className="homecard-main">
                    <Text className="homecard-main__label">{homeTitle}</Text>
                    <Text>Tiền điện: {props.electricityPrice} VNĐ</Text>
                    <Text>Tiền nước: {props.waterPrice} VNĐ</Text>
                    <Link href={`/home/${props._id}`}>
                        <a className="homecard-main__setprev"></a>
                    </Link>
                    {removeAble && (
                        <div className="homecard-main__action">
                            <Menu placement="bottom-end">
                                <MenuButton>
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </MenuButton>
                                <MenuList>
                                    <MenuItem onClick={onOpenDialog}>Xóa trọ</MenuItem>
                                </MenuList>
                            </Menu>
                        </div>
                    )}
                </div>
            </motion.div>
            {removeAble && (
                <AlertDialog
                    isOpen={isOpenDialog}
                    leastDestructiveRef={cancelDeleteRef}
                    onClose={onCloseDialog}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Xóa trọ
                            </AlertDialogHeader>

                            <AlertDialogBody>Bạn có chắc chắn muốn xóa trọ này?</AlertDialogBody>

                            <AlertDialogFooter>
                                <Button ref={cancelDeleteRef} onClick={onCloseDialog}>
                                    Hủy
                                </Button>
                                <Button
                                    colorScheme="red"
                                    isLoading={deleting}
                                    onClick={() => {
                                        setDeleting(true);
                                        deleteAllFile(listPath)
                                            .then(() => {
                                                deleteCurrentHome().then(() => {
                                                    props.afterDelete
                                                        ? props.afterDelete().then(() => {
                                                              mount.current && onCloseDialog();
                                                          })
                                                        : mount.current && onCloseDialog();
                                                    toast({
                                                        title: `Xóa trọ thành công`,
                                                        position: 'bottom-left',
                                                        status: 'success',
                                                        isClosable: true,
                                                    });
                                                });
                                            })
                                            .catch((e) => {
                                                console.log(e);
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
                                    Đồng ý
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            )}
        </>
    );
}
