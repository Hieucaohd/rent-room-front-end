import styles from '../styles/style.module.scss';
import {
    Box,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    useToast,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import useClassName from '@lib/useClassName';
import { HomePrices, updateHomePrices } from '@lib/apollo/home/update';
import { getHomeById } from '@lib/apollo/home/gethomebyid';
import { HomeData } from '@lib/interface';
import { Checkbox } from '@chakra-ui/checkbox';
import useScrollController from '@lib/useScrollController';
import useResize from '@lib/use-resize';

interface ErrorAction {
    electricityPrice: boolean;
    waterPrice: boolean;
    internetPrice: boolean;
    cleaningPrice: boolean;
}

interface FormProps {
    closeForm: () => void;
    callback?: () => void;
    _id: string;
    electricityPrice?: number;
    waterPrice?: number;
    internetPrice?: number;
    cleaningPrice?: number;
}

const ModifyHomePrices = ({
    closeForm,
    _id: homeId,
    electricityPrice,
    waterPrice,
    internetPrice,
    cleaningPrice,
    callback,
}: FormProps) => {
    const toast = useToast();
    const [mobilemode] = useResize(500);
    const [updateHome, { data }] = useMutation(updateHomePrices.command, {
        update(cache, { data: { updateHome } }) {
            const data = cache.readQuery<{ getHomeById: HomeData }>({
                query: getHomeById.command,
                variables: getHomeById.variables(homeId),
            });
            if (data) {
                const newData = { ...data.getHomeById, ...updateHome };
                cache.writeQuery({
                    query: getHomeById.command,
                    variables: getHomeById.variables(homeId),
                    data: {
                        getHomeById: newData,
                    },
                });
            }
        },
        onCompleted: () => {
            toast({
                title: `Cập nhật trọ thành công`,
                position: 'bottom-left',
                status: 'success',
                isClosable: true,
            });
            callback && callback();
            // setUpLoading(false);
            closeForm();
            // console.log(client)
        },
    });
    const { register, handleSubmit, getValues } = useForm<HomePrices>();
    const [upLoading, setUpLoading] = useState(false);
    const [errorAction, setErrorAction] = useState<ErrorAction>({
        electricityPrice: false,
        waterPrice: false,
        internetPrice: false,
        cleaningPrice: false,
    });

    const [activeElectricityPrice, setActiveElectricityPrice] = useState(true);
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
        (e: HomePrices) => {
            let errorSubmit = false;
            console.log(e);
            let errorHandleForm: ErrorAction = {
                electricityPrice: false,
                waterPrice: false,
                internetPrice: false,
                cleaningPrice: false,
            };
            if (isNaN(e.cleaningPrice) && activeCleaningPrice) {
                errorHandleForm.cleaningPrice = true;
                errorSubmit = true;
            } else if (!activeCleaningPrice) {
                e.cleaningPrice = undefined;
            }
            if (isNaN(e.electricityPrice) && activeElectricityPrice) {
                errorHandleForm.electricityPrice = true;
                errorSubmit = true;
            } else if (!activeElectricityPrice) {
                e.electricityPrice = undefined;
            }
            if (isNaN(e.internetPrice) && activeInternetPrice) {
                errorHandleForm.internetPrice = true;
                errorSubmit = true;
            } else if (!activeInternetPrice) {
                e.internetPrice = undefined;
            }
            if (isNaN(e.waterPrice) && activeWaterPrice) {
                errorHandleForm.waterPrice = true;
                errorSubmit = true;
            } else if (!activeWaterPrice) {
                e.waterPrice = undefined;
            }
            if (errorSubmit) {
                setErrorAction(errorHandleForm);
            } else {
                setUpLoading(true);
                updateHome({
                    mutation: updateHomePrices.command,
                    variables: updateHomePrices.variables(e, homeId),
                }).catch((error) => {
                    toast({
                        title: `Server timeout`,
                        position: 'bottom-left',
                        status: 'error',
                        description: 'Có vấn đề với kết nối',
                        isClosable: true,
                    });
                    setUpLoading(false);
                    console.log(error);
                });
            }
        },
        [activeCleaningPrice, activeElectricityPrice, activeInternetPrice, activeWaterPrice]
    );

    return (
        <Modal
            onClose={closeForm}
            isOpen={true}
            scrollBehavior="outside"
            {...(mobilemode ? { size: 'full' } : {})}
        >
            <ModalOverlay overflowY="scroll" />
            <ModalContent maxWidth="500px" {...(mobilemode ? { borderRadius: 0 } : {})}>
                <ModalHeader>Thông tin phòng</ModalHeader>
                <ModalCloseButton tabIndex={-1} />
                <ModalBody>
                    <Box className="addhome-form">
                        <form onSubmit={handleSubmit(submitForm)}>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap="5px"
                                {...className('homeform-form__label')}
                            >
                                <Checkbox
                                    isChecked={activeElectricityPrice}
                                    onChange={(e) => {
                                        setActiveElectricityPrice((prev) => !prev);
                                    }}
                                    _focus={{
                                        boxShadow: 'none',
                                    }}
                                    height="100%"
                                    colorScheme="cyan"
                                >
                                    Tiền điện
                                </Checkbox>
                            </Box>
                            <Tooltip
                                label="số tiền điện không hợp lệ"
                                borderRadius="3px"
                                placement="bottom"
                                isDisabled={
                                    !errorAction.electricityPrice || !activeElectricityPrice
                                }
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
                                    isDisabled={!activeElectricityPrice}
                                    borderColor={
                                        errorAction.electricityPrice && activeElectricityPrice
                                            ? 'red'
                                            : 'inherit'
                                    }
                                    {...register('electricityPrice', { valueAsNumber: true })}
                                    onChange={(e) => {
                                        setErrorAction({ ...errorAction, electricityPrice: false });
                                        register('electricityPrice', {
                                            valueAsNumber: true,
                                        }).onChange(e);
                                    }}
                                    defaultValue={electricityPrice}
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
                                    isChecked={activeWaterPrice}
                                    onChange={(e) => {
                                        setActiveWaterPrice((prev) => !prev);
                                    }}
                                    height="100%"
                                    colorScheme="cyan"
                                >
                                    Tiền nước
                                </Checkbox>
                            </Box>
                            <Tooltip
                                label="bạn chưa nhập giá tiền nước"
                                borderRadius="3px"
                                placement="bottom"
                                isDisabled={!errorAction.waterPrice || !activeWaterPrice}
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
                                    isDisabled={!activeWaterPrice}
                                    borderColor={
                                        errorAction.waterPrice && activeWaterPrice
                                            ? 'red'
                                            : 'inherit'
                                    }
                                    {...register('waterPrice', { valueAsNumber: true })}
                                    onChange={(e) => {
                                        setErrorAction({ ...errorAction, waterPrice: false });
                                        register('waterPrice', { valueAsNumber: true }).onChange(e);
                                    }}
                                    defaultValue={waterPrice}
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
                                    isChecked={activeInternetPrice}
                                    onChange={(e) => {
                                        setActiveInternetPrice((prev) => !prev);
                                    }}
                                    height="100%"
                                    colorScheme="cyan"
                                >
                                    Tiền mạng
                                </Checkbox>
                            </Box>
                            <Tooltip
                                label="Bạn chưa nhập tiền mạng"
                                borderRadius="3px"
                                placement="bottom"
                                isDisabled={!errorAction.internetPrice || !activeInternetPrice}
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
                                    isDisabled={!activeInternetPrice}
                                    borderColor={
                                        errorAction.internetPrice && activeInternetPrice
                                            ? 'red'
                                            : 'inherit'
                                    }
                                    {...register('internetPrice', { valueAsNumber: true })}
                                    onChange={(e) => {
                                        setErrorAction({ ...errorAction, internetPrice: false });
                                        register('internetPrice').onChange(e);
                                    }}
                                    defaultValue={internetPrice}
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
                                    isChecked={activeCleaningPrice}
                                    onChange={(e) => {
                                        setActiveCleaningPrice((prev) => !prev);
                                    }}
                                    height="100%"
                                    colorScheme="cyan"
                                >
                                    Tiền dọn dẹp
                                </Checkbox>
                            </Box>
                            <Tooltip
                                label="Bạn chưa nhập giá tiền dọn dẹp"
                                borderRadius="3px"
                                placement="bottom"
                                isDisabled={!errorAction.cleaningPrice || !activeCleaningPrice}
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
                                    isDisabled={!activeCleaningPrice}
                                    borderColor={
                                        errorAction.cleaningPrice && activeCleaningPrice
                                            ? 'red'
                                            : 'inherit'
                                    }
                                    {...register('cleaningPrice', { valueAsNumber: true })}
                                    onChange={(e) => {
                                        setErrorAction({ ...errorAction, cleaningPrice: false });
                                        register('cleaningPrice').onChange(e);
                                    }}
                                    defaultValue={cleaningPrice}
                                    placeholder="VNĐ"
                                    type="number"
                                />
                            </Tooltip>
                        </form>
                    </Box>
                </ModalBody>
                <ModalFooter>
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
                                !activeElectricityPrice &&
                                !activeWaterPrice &&
                                !activeInternetPrice &&
                                !activeCleaningPrice
                            }
                            onClick={() => {
                                const data = getValues();
                                submitForm(data);
                            }}
                            isLoading={upLoading}
                            type="submit"
                            colorScheme="red"
                        >
                            Cập nhật
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export * from './editDescription';
export * from './editLocation';
export * from './deleteHome';

export default ModifyHomePrices;
