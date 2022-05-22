import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { getRoomSaved, updateRoom as updateRoomSaved } from '@lib/apollo/profile';
import useStore from '@store/useStore';
import Slider from '@components/Slider';
import { RoomData } from '@lib/interface';

interface RoomCardProps {
    width?: any;
    height?: any;
    data: RoomData;
}

export default function RoomCard(props: RoomCardProps) {
    const data = props.data;
    return (
        <Link href={`/room/${data._id}`}>
            <a className="zoomcard">
                <Slider
                    images={data?.images}
                    {...(props.width ? { width: props.width } : {})}
                    {...(props.height ? { height: props.height } : {})}
                />

                <div className="zoomcard__name">
                    <div>Phòng số {data?.roomNumber}</div>
                    <div>{data?.price}&nbsp;VNĐ/tháng</div>
                </div>
                <div className="zoomcard__moreinfo">
                    <div>
                        Diện tích {data?.square}
                        <div>
                            &nbsp;m<span>2</span>
                        </div>
                    </div>
                    <div>{data?.isRented ? 'đã được cho thuê' : 'chưa được cho thuê'}</div>
                </div>
            </a>
        </Link>
    );
}

const PopUp = ({
    removePopup,
    removeCurrentRoom,
}: {
    removePopup: () => void;
    removeCurrentRoom: () => void;
}) => {
    const [loading, setLoading] = useState(false);
    const cancelRef = React.useRef(null);
    const toast = useToast();
    return (
        <AlertDialog isOpen={true} leastDestructiveRef={cancelRef} onClose={removePopup}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Thông báo
                    </AlertDialogHeader>

                    <AlertDialogBody>Bạn có chắc chắn muốn bỏ lưu phòng này</AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={removePopup}>
                            Hủy
                        </Button>
                        <Button
                            colorScheme="red"
                            isLoading={loading}
                            onClick={() => {
                                setLoading(true);
                                removeCurrentRoom();
                                toast({
                                    status: 'success',
                                    title: 'Thông báo',
                                    description: 'Đã xóa phòng khỏi danh sách yêu thích',
                                    isClosable: true,
                                    position: 'bottom-left',
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
    );
};

export function RoomSaveCard(
    props: RoomCardProps & { userid: string; callBack?: () => Promise<any> }
) {
    const data = props.data;
    const { createPopup, removePopup } = useStore();

    const removeCurrentRoom = useCallback(() => {
        const listSaved = getRoomSaved(props.userid);
        const newList = listSaved.filter((item) => item != data._id);
        updateRoomSaved(props.userid, newList);
        props.callBack && props.callBack();
        removePopup();
    }, []);

    return (
        <Link href={`/room/${data._id}`}>
            <a className="zoomcard">
                <Button
                    onClick={() => {
                        createPopup(
                            <PopUp
                                removePopup={removePopup}
                                removeCurrentRoom={removeCurrentRoom}
                            />
                        );
                    }}
                >
                    <i className="fa-solid fa-trash-can"></i>
                </Button>
                <Slider
                    images={data?.images}
                    {...(props.width ? { width: props.width } : {})}
                    {...(props.height ? { height: props.height } : {})}
                />
                <div className="zoomcard__name">
                    <div>Phòng số {data?.roomNumber}</div>
                    <div>{data?.price}&nbsp;VNĐ/tháng</div>
                </div>
                <div className="zoomcard__moreinfo">
                    <div>
                        Diện tích {data?.square}
                        <div>
                            &nbsp;m<span>2</span>
                        </div>
                    </div>
                    <div>{data?.isRented ? 'đã được cho thuê' : 'chưa được cho thuê'}</div>
                </div>
            </a>
        </Link>
    );
}
