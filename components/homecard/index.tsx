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
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Skeleton,
    SkeletonText,
    Text,
    useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { deleteHome } from '../../lib/apollo/home';
import { deleteAllFile, deleteFile, getPathFileFromLink } from '../../lib/upLoadAllFile';
import NextImage from '../nextimage/image';
import Slider from '../Slider';

export interface HomeCardProps {
    _id: string;
    province?: any;
    district?: any;
    ward?: any;
    liveWithOwner?: Boolean;
    electricityPrice?: number;
    waterPrice?: number;
    images: string[];
    totalRooms?: number;
    __typename?: any;
    afterDelete?: () => any;
}

export default function HomeCard(props: HomeCardProps) {
    const mount = useRef(false);
    const [deleteCurrentHome] = useMutation(deleteHome.command, {
        variables: deleteHome.variable(props._id),
    });
    const [listPath, setListPath] = useState<(string | null)[]>([]);
    const [nameProvince, setNameProvince] = useState('');
    const [nameDistrict, setNameDistrict] = useState('');
    const [nameWard, setNameWard] = useState('');
    const [loading, setLoading] = useState(true);
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
        if (props.province) {
            fetch(`https://provinces.open-api.vn/api/p/${props.province}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.name && mount.current) {
                        setNameProvince(data.name.replace('Thành phố ', '').replace('Tỉnh ', ''));
                    }
                });
        }
    }, []);

    useEffect(() => {
        const paths = props.images.map((item) => {
            return getPathFileFromLink(item);
        });
        if (paths && mount.current) {
            setListPath(paths);
        }
    }, [props.images]);

    useEffect(() => {
        if (props.district) {
            fetch(`https://provinces.open-api.vn/api/d/${props.district}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.name && mount.current) {
                        setNameDistrict(data.name.replace('Quận ', '').replace('Huyện ', ''));
                    }
                });
        }
    }, []);

    useEffect(() => {
        if (props.ward) {
            fetch(`https://provinces.open-api.vn/api/w/${props.ward}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.name && mount.current) {
                        setNameWard(data.name);
                    }
                });
        }
    }, []);

    useEffect(() => {
        if (nameProvince != '' && nameDistrict != '' && nameWard != '' && mount.current) {
            setLoading(false);
        }
    }, [nameProvince, nameDistrict, nameWard]);

    return (
        <>
            <div className={`homecard${loading ? ' loading' : ''}`}>
                <div className="homecard__imgslider">
                    <Slider images={props.images} width="100%" height="280px" />
                </div>
                <div className="homecard-main">
                    <Text className="homecard-main__label">
                        {loading
                            ? 'Loading...'
                            : nameWard + ', ' + nameDistrict + ', ' + nameProvince}
                    </Text>
                    <Text>Tiền điện: {props.electricityPrice} VNĐ</Text>
                    <Text>Tiền nước: {props.waterPrice} VNĐ</Text>
                    <div className="homecard-main__action">
                        <Menu placement="bottom-end">
                            <MenuButton>
                                <i className="fi fi-bs-menu-dots-vertical"></i>
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={onOpenDialog}>Xóa trọ</MenuItem>
                            </MenuList>
                        </Menu>
                    </div>
                </div>
            </div>
            {loading && (
                <Box>
                    <Skeleton borderRadius={'10px'} height="270px"></Skeleton>
                    <SkeletonText mt="4" noOfLines={3} spacing="4" />
                </Box>
            )}
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
                                            });
                                        })
                                        .catch((e) => {
                                            console.log(e);
                                            deleteCurrentHome().then(() => {
                                                props.afterDelete
                                                    ? props.afterDelete().then(() => {
                                                          mount.current && onCloseDialog();
                                                      })
                                                    : mount.current && onCloseDialog();
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
        </>
    );
}
