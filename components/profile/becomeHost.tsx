import { useMutation } from '@apollo/client';
import { InputStyle } from '@chakra';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Input,
} from '@chakra-ui/react';
import { removeAllRoomSaved, updateUserType } from '@lib/apollo/profile';
import { removeVietnameseTones } from '@lib/removeVietnamese';
import useResize from '@lib/use-resize';
import { User } from '@lib/withAuth';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useRef, useState } from 'react';

interface Props {
    closeForm: () => void;
    callback?: () => void;
    user: User;
}

export function BecomeHost(props: Props) {
    const router = useRouter();
    const [mobilemode] = useResize();
    const [update] = useMutation(updateUserType.command, {
        variables: updateUserType.variables(),
        onCompleted: () => {
            removeAllRoomSaved(props.user._id);
            router.reload();
        },
    });
    const cancelRef = useRef(null);
    const [value, typing] = useState('');
    const [loading, setLoading] = useState(false);
    const trueValue = useRef('Toi dong y');

    const updateToHost = useCallback(() => {
        setLoading(true);
        update();
    }, []);

    const isTrue = useMemo(() => {
        const val = removeVietnameseTones(value);
        return val == trueValue.current;
    }, [value]);

    return (
        <>
            <AlertDialog
                isOpen={true}
                {...(mobilemode
                    ? {
                          size: 'full',
                      }
                    : {})}
                leastDestructiveRef={cancelRef}
                onClose={props.closeForm}
            >
                <AlertDialogOverlay>
                    <motion.div
                        {...(!mobilemode
                            ? {
                                  initial: {
                                      zoom: 0,
                                      transformOrigin: 'center',
                                  },
                                  animate: {
                                      zoom: 1,
                                      transformOrigin: 'center',
                                  },
                                  transition: {
                                      duration: 0.5,
                                  },
                              }
                            : {})}
                    >
                        <AlertDialogContent
                            {...(mobilemode
                                ? {
                                      borderRadius: 0,
                                  }
                                : {})}
                        >
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Thông báo
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                <Box display="flex" flexFlow="column" gap="10px">
                                    <div>
                                        Nhập "Tôi đồng ý" để trở thành chủ nhà. Thao tác này sẽ
                                        không thể hoàn tác.
                                    </div>
                                    <Input
                                        {...InputStyle}
                                        height="40px"
                                        value={value}
                                        onChange={(e) => typing(e.target.value)}
                                        placeholder="Bạn đồng ý?"
                                    />
                                </Box>
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={props.closeForm}>
                                    Hủy
                                </Button>
                                <Button
                                    isLoading={loading}
                                    colorScheme="red"
                                    isDisabled={!isTrue}
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
