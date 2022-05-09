import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { getRoomSaved, saveRoom, updateRoom as updateRoomSaved } from '../../../lib/apollo/profile';
import useStore from '../../../store/useStore';
import Slider from '../../Slider';

interface RoomCardProps {
    width?: any;
    height?: any;
    data: RoomData;
}

export interface RoomData {
    _id: string;
    price: number;
    square: number;
    isRented: boolean;
    floor: number;
    images: string[];
    roomNumber: number;
}

export default function RoomCard(props: RoomCardProps) {
    const data = props.data;
    return (
        <div className="zoomcard">
            <Slider
                images={data?.images}
                {...(props.width ? { width: props.width } : {})}
                {...(props.height ? { height: props.height } : {})}
            />
            <Link href={`/room/${data._id}`}>
                <a>
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
        </div>
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
        props.callBack
            ? props.callBack().then(() => {
                  removePopup();
              })
            : (() => {
                  removePopup();
              })();
    }, []);

    return (
        <div className="zoomcard">
            <Button
                onClick={() => {
                    createPopup(
                        <PopUp removePopup={removePopup} removeCurrentRoom={removeCurrentRoom} />
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
            <Link href={`/room/${data._id}`}>
                <a>
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
        </div>
    );
}
