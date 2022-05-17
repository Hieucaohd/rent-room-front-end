import { useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
} from '@chakra-ui/react';
import { removeAllRoomSaved, updateUserType } from '@lib/apollo/profile';
import { User } from '@lib/withAuth';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useCallback, useRef, useState } from 'react';

interface Props {
    closeForm: () => void;
    callback?: () => void;
    user: User;
}

export function BecomeHost(props: Props) {
    const router = useRouter();
    const [update] = useMutation(updateUserType.command, {
        variables: updateUserType.variables(),
        onCompleted: () => {
            removeAllRoomSaved(props.user._id);
            router.reload();
        },
    });
    const cancelRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const updateToHost = useCallback(() => {
        setLoading(true);
        update();
    }, []);

    return (
        <>
            <AlertDialog isOpen={true} leastDestructiveRef={cancelRef} onClose={props.closeForm}>
                <AlertDialogOverlay>
                    <motion.div
                        initial={{
                            zoom: 0,
                            transformOrigin: 'center',
                        }}
                        animate={{
                            zoom: 1,
                            transformOrigin: 'center',
                        }}
                        transition={{
                            duration: 0.5,
                        }}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Thông báo
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Bạn có chắc chắn muốn trở thành chủ nhà? Thao tác này không thể hoàn
                                tác.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={props.closeForm}>
                                    Hủy
                                </Button>
                                <Button
                                    isLoading={loading}
                                    colorScheme="red"
                                    onClick={updateToHost}
                                    ml={3}
                                >
                                    Đồng ý
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </motion.div>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}
