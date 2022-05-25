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
import { deleteHome } from '@lib/apollo/home';
import { HomeData } from '@lib/interface';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';
import { useMemo, useRef, useState } from 'react';
import { removeVietnameseTones } from '@lib/removeVietnamese';
import useResize from '@lib/use-resize';

interface Props {
    closeForm: () => void;
    callback?: () => any;
    homeData: HomeData;
}

export function DeleteHome({ closeForm, homeData }: Props) {
    const [deleteCurrentHome] = useMutation(deleteHome.command, {
        variables: deleteHome.variables(homeData._id),
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
                            Xóa trọ
                        </AlertDialogHeader>

                        <AlertDialogBody display="flex" flexFlow="column" gap="10px">
                            <div>Nhập "Tôi chắc chắn" để xóa trọ này?</div>
                            <div>
                                <Input
                                    {...InputStyle}
                                    height="40px"
                                    value={value}
                                    onChange={(e) => typing(e.target.value)}
                                    placeholder="Bạn chắc chắn?"
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
                                    const listPath = homeData.images.map((item) => {
                                        return getPathFileFromLink(item);
                                    });
                                    deleteAllFile(listPath)
                                        .then(() => {
                                            deleteCurrentHome().then(() => {
                                                toast({
                                                    title: `Xóa trọ thành công`,
                                                    position: 'bottom-left',
                                                    status: 'success',
                                                    isClosable: true,
                                                });
                                                location.replace('/profile?page=1');
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
