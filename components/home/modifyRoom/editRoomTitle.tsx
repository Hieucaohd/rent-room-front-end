import styles from '../styles/style.module.scss';
import { Box, Button, Input, Text, Tooltip } from '@chakra-ui/react';
import { motion, Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import useClassName from '../../../lib/useClassName';
import { HomeData } from '../../../pages/home/[homeid]';
import { Checkbox } from '@chakra-ui/checkbox';
import useScrollController from '../../../lib/useScrollController';
import { getSSRRoomById, UpdateRoomTitle, updateRoomTitle } from '../../../lib/apollo/home/room';

const container: Variants = {
    show: {
        opacity: 1,
    },
    hidden: {
        opacity: 0,
    },
};

const formAnimate: Variants = {
    show: {
        opacity: 1,
        y: 0,
    },
    hidden: {
        opacity: 0,
        y: -100,
    },
};

interface ErrorAction {
    roomNumber: boolean;
    price: boolean;
    square: boolean;
    isRented: boolean;
    floor: boolean;
}

interface FormProps {
    closeForm: () => void;
    roomId: string;
    callback?: () => void;
}

export const EditRoomTitle = ({ closeForm, roomId, callback }: FormProps) => {
    const mount = useRef(false);
    const [updateHome, { data }] = useMutation(updateRoomTitle.command, {
        update(cache, { data: { updateHome } }) {
            const data = cache.readQuery<{ getHomeById: HomeData }>({
                query: getSSRRoomById.command,
                variables: getSSRRoomById.variables(roomId),
            });
            if (data) {
                const newData = { ...data.getHomeById, ...updateHome };
                cache.writeQuery({
                    query: getSSRRoomById.command,
                    variables: getSSRRoomById.variables(roomId),
                    data: {
                        getHomeById: newData,
                    },
                });
            }
        },
        onCompleted: () => {
            callback && callback();
            // setUpLoading(false);
            closeForm();
            // console.log(client)
        },
    });
    const { register, handleSubmit } = useForm<UpdateRoomTitle>();
    const [upLoading, setUpLoading] = useState(false);
    const [errorAction, setErrorAction] = useState<ErrorAction>({
        roomNumber: false,
        price: false,
        square: false,
        isRented: false,
        floor: false,
    });

    const [activeRoomNumber, setActiveElectricityPrice] = useState(true);
    const [activeWaterPrice, setActiveWaterPrice] = useState(true);
    const [activeInternetPrice, setActiveInternetPrice] = useState(true);
    const [activeCleaningPrice, setActiveCleaningPrice] = useState(true);

    const [className] = useClassName(styles);
    const scroll = useScrollController();

    useEffect(() => {
        scroll.disableScroll();

        return () => {
            scroll.enableScroll();
        };
    }, []);

    const submitForm = useCallback(
        (e: UpdateRoomTitle) => {
            let errorSubmit = false;
            console.log(e);
            let errorHandleForm: ErrorAction = {
                roomNumber: false,
                price: false,
                square: false,
                isRented: false,
                floor: false,
            };
            if (errorSubmit) {
                setErrorAction(errorHandleForm);
            } else {
                /* setUpLoading(true);
                updateHome({
                    variables: updateRoomTitle.variables(e, roomId),
                }).catch((error) => {
                    setUpLoading(false);
                    console.log(error);
                }); */
            }
        },
        [activeCleaningPrice, activeRoomNumber, activeInternetPrice, activeWaterPrice]
    );

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            {...className('homeform')}
        >
            <div {...className('homeform__bg')}></div>
            <motion.div
                {...className('homeform-form')}
                variants={formAnimate}
                initial="hidden"
                animate="show"
                exit="hidden"
            >
                <form onSubmit={handleSubmit(submitForm)}>
                    <Text {...className('homeform-form__h1')}>Thêm phòng</Text>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="5px"
                        {...className('homeform-form__label')}
                    >
                        <Checkbox
                            isChecked={activeRoomNumber}
                            onChange={(e) => {
                                setActiveElectricityPrice((prev) => !prev);
                            }}
                            _focus={{
                                boxShadow: 'none',
                            }}
                            height="100%"
                            colorScheme="cyan"
                        >
                            Ma so phong
                        </Checkbox>
                    </Box>
                    <Tooltip
                        label="số tiền điện không hợp lệ"
                        borderRadius="3px"
                        placement="bottom"
                        isDisabled={!errorAction.roomNumber || !activeRoomNumber}
                        bg="red"
                        hasArrow
                    >
                        <Input
                            height="50px"
                            borderWidth="3px"
                            cursor="pointer"
                            _focus={{
                                outline: 'none',
                                borderColor: '#80befc',
                            }}
                            isDisabled={!activeRoomNumber}
                            borderColor={
                                errorAction.roomNumber && activeRoomNumber
                                    ? 'red'
                                    : 'inherit'
                            }
                            {...register('roomNumber', { valueAsNumber: true })}
                            onChange={(e) => {
                                setErrorAction({ ...errorAction, roomNumber: false });
                                register('roomNumber', { valueAsNumber: true }).onChange(e);
                            }}
                            placeholder="VNĐ"
                            type="number"
                        />
                    </Tooltip>

                    <div className="addhome-form__submit">
                        <Button
                            onClick={() => {
                                closeForm();
                                setUpLoading(false);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            isDisabled={
                                !activeRoomNumber &&
                                !activeWaterPrice &&
                                !activeInternetPrice &&
                                !activeCleaningPrice
                            }
                            isLoading={upLoading}
                            type="submit"
                            colorScheme="red"
                        >
                            Cập nhật
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};
