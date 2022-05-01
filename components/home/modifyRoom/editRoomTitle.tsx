import styles from '../styles/style.module.scss';
import { Box, Button, Input, Text, Tooltip, Select } from '@chakra-ui/react';
import { motion, Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import useClassName from '../../../lib/useClassName';
import { Checkbox } from '@chakra-ui/checkbox';
import useScrollController from '../../../lib/useScrollController';
import {
    getSSRRoomById,
    RoomData,
    UpdateRoomTitle,
    updateRoomTitle,
} from '../../../lib/apollo/home/room';

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
    const [updateRoom, { data }] = useMutation(updateRoomTitle.command, {
        update(cache, { data: { updateRoom } }) {
            const data = cache.readQuery<{ getRoomById: RoomData }>({
                query: getSSRRoomById.command,
                variables: getSSRRoomById.variables(roomId),
            });
            console.log(updateRoom);
            if (data) {
                const newData = { ...data.getRoomById, ...updateRoom };
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

    const [activeRoomNumber, setActiveRoomNumber] = useState(true);
    const [activePrice, setActivePrice] = useState(true);
    const [activeSquare, setActiveSquare] = useState(true);
    const [activeRented, setActiveRented] = useState(true);
    const [activeFloor, setActiveFloor] = useState(true);

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
            if (activeRoomNumber && (!e.roomNumber || isNaN(e.roomNumber))) {
                errorHandleForm.roomNumber = true;
                errorSubmit = true;
            } else if (!activeRoomNumber) {
                e.roomNumber = undefined;
            }
            if (activePrice && (!e.price || isNaN(e.price))) {
                errorHandleForm.price = true;
                errorSubmit = true;
            } else if (!activePrice) {
                e.price = undefined;
            }
            if (!activeRented) {
                e.isRented = undefined;
            }
            console.log(e);
            if (errorSubmit) {
                setErrorAction(errorHandleForm);
            } else {
                setUpLoading(true);
                updateRoom({
                    variables: updateRoomTitle.variables(e, roomId),
                }).catch((error) => {
                    setUpLoading(false);
                    console.log(error);
                });
            }
        },
        [activeRoomNumber, activePrice]
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
                    <Text {...className('homeform-form__h1')}>Sửa phòng</Text>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="5px"
                        {...className('homeform-form__label')}
                    >
                        <Checkbox
                            isChecked={activeRoomNumber}
                            onChange={(e) => {
                                setActiveRoomNumber((prev) => !prev);
                            }}
                            _focus={{
                                boxShadow: 'none',
                            }}
                            height="100%"
                            colorScheme="cyan"
                        >
                            Mã số phòng
                        </Checkbox>
                    </Box>
                    <Tooltip
                        label="mã số phòng không hợp lệ"
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
                                errorAction.roomNumber && activeRoomNumber ? 'red' : 'inherit'
                            }
                            {...register('roomNumber', { valueAsNumber: true })}
                            onChange={(e) => {
                                setErrorAction({ ...errorAction, roomNumber: false });
                                register('roomNumber', { valueAsNumber: true }).onChange(e);
                            }}
                            placeholder="eg: 2004"
                            type="number"
                        />
                    </Tooltip>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="5px"
                        {...className('homeform-form__label')}
                    >
                        <Checkbox
                            isChecked={activePrice}
                            onChange={(e) => {
                                setActivePrice((prev) => !prev);
                            }}
                            _focus={{
                                boxShadow: 'none',
                            }}
                            height="100%"
                            colorScheme="cyan"
                        >
                            Tiền phòng
                        </Checkbox>
                    </Box>
                    <Tooltip
                        label="tiền phòng không hợp lệ"
                        borderRadius="3px"
                        placement="bottom"
                        isDisabled={!errorAction.price || !activePrice}
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
                            isDisabled={!activePrice}
                            borderColor={errorAction.price && activePrice ? 'red' : 'inherit'}
                            {...register('price', { valueAsNumber: true })}
                            onChange={(e) => {
                                setErrorAction({ ...errorAction, price: false });
                                register('price', { valueAsNumber: true }).onChange(e);
                            }}
                            placeholder="VNĐ"
                            type="number"
                        />
                    </Tooltip>

                    <Box
                        display="flex"
                        alignItems="center"
                        gap="5px"
                        {...className('homeform-form__label')}
                    >
                        <Checkbox
                            isChecked={activeRented}
                            onChange={(e) => {
                                setActiveRented((prev) => !prev);
                            }}
                            _focus={{
                                boxShadow: 'none',
                            }}
                            height="100%"
                            colorScheme="cyan"
                        >
                            Trạng thái phòng
                        </Checkbox>
                    </Box>
                    <Select
                        height="50px"
                        borderWidth="3px"
                        cursor="pointer"
                        _focus={{
                            outline: 'none',
                            borderColor: '#80befc',
                        }}
                        {...register('isRented', {
                            setValueAs: (value: string) => {
                                if (value == 'true') {
                                    return true
                                }
                                return false
                            }
                        })}
                        defaultValue="false"
                        isDisabled={!activeRented}
                    >
                        <option value="true">Đã được cho thuê</option>
                        <option value="false">Chưa được cho thuê</option>
                    </Select>

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
                            isDisabled={!activeRoomNumber && !activePrice && !activeRented}
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
