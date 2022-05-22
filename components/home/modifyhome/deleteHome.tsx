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
import { deleteHome } from '@lib/apollo/home';
import { HomeData } from '@lib/interface';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';
import { useRef, useState } from 'react';

interface Props {
    closeForm: () => void;
    callback?: () => any;
    homeData: HomeData;
}

export default function DeleteHome({ closeForm, homeData }: Props) {
    const [deleteCurrentHome] = useMutation(deleteHome.command, {
        variables: deleteHome.variable(homeData._id),
    });
    const ref = useRef(null);
    const toast = useToast();
    const [deleting, setDeleting] = useState(false);
    return (
        <>
            <AlertDialog isOpen={true} leastDestructiveRef={ref} onClose={closeForm}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Xóa trọ
                        </AlertDialogHeader>

                        <AlertDialogBody>Bạn có chắc chắn muốn xóa trọ này?</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={closeForm}>Hủy</Button>
                            <Button
                                colorScheme="red"
                                isLoading={deleting}
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
                                                location.replace('/user/yourprofile?page=1');
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
