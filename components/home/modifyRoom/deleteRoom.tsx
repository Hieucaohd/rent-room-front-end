import { useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Input,
    useToast,
} from '@chakra-ui/react';
import { InputStyle } from '@chakra';
import { RoomData } from '@lib/interface';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';
import { useMemo, useRef, useState } from 'react';
import { removeVietnameseTones } from '@lib/removeVietnamese';
import { deleteRoomById } from '@lib/apollo/home/room';
import useResize from '@lib/use-resize';

interface Props {
    closeForm: () => void;
    callback?: () => any;
    roomData: RoomData;
}

export function DeleteRoom({ closeForm, roomData }: Props) {
    const [deleteRoom] = useMutation(deleteRoomById.command, {
        variables: deleteRoomById.variables(roomData._id),
    });
    const ref = useRef(null);
    const toast = useToast();
    const [mobilemode] = useResize();
    const [deleting, setDeleting] = useState(false);
    const [value, typing] = useState('');
    const trueValue = useRef('Toi chac chan');

    const isTrue = useMemo(() => {
        const val = removeVietnameseTones(value);
        console.log(val, trueValue.current);
        return val == trueValue.current;
    }, [value]);

    return (
        <>
            <AlertDialog
                isOpen={true}
                leastDestructiveRef={ref}
                {...(mobilemode
                    ? {
                          size: '2xl',
                      }
                    : {})}
                onClose={closeForm}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent
                        {...(mobilemode
                            ? {
                                  borderRadius: '0',
                              }
                            : {})}
                    >
                        <AlertDialogHeader fontSize="lg" paddingBottom="5px" fontWeight="bold">
                            Xóa phòng
                        </AlertDialogHeader>

                        <AlertDialogBody display="flex" flexFlow="column" gap="10px">
                            <div>Nhập "Tôi chắc chắn" để xóa phòng này?</div>
                            <div>
                                <Input
                                    {...InputStyle}
                                    height="40px"
                                    value={value}
                                    onChange={(e) => typing(e.target.value)}
                                    placeholder="Tôi chắc chắn?"
                                />
                            </div>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={closeForm}>Hủy</Button>
                            <Button
                                colorScheme="red"
                                isLoading={deleting}
                                isDisabled={!isTrue}
                                onClick={() => {
                                    setDeleting(true);
                                    const listPath = roomData.images.map((item) => {
                                        return getPathFileFromLink(item);
                                    });
                                    deleteAllFile(listPath)
                                        .then(() => {
                                            deleteRoom().then(() => {
                                                toast({
                                                    title: `Xóa phòng thành công`,
                                                    position: 'bottom-left',
                                                    status: 'success',
                                                    isClosable: true,
                                                });
                                                window.location.replace(
                                                    `/home/${roomData.home._id}`
                                                );
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
        </>
    );
}
