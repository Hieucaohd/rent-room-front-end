import styles from '../styles/style.module.scss';
import { Box, Button, Input, Text, Tooltip, Select, Progress } from '@chakra-ui/react';
import { motion, Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import useClassName from '@lib/useClassName';
import { Checkbox } from '@chakra-ui/checkbox';
import useScrollController from '@lib/useScrollController';
import { getSSRRoomById, RoomData, UpdateRoomTitle, updateRoomTitle } from '@lib/apollo/home/room';
import { Image } from '../addhome';
import { getDownloadURL, list, ref, uploadBytesResumable } from 'firebase/storage';
import randomkey, { getTypeFile } from '@lib/randomkey';
import { fStorage } from '@firebase';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';

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
    images: boolean;
}

interface FormProps {
    closeForm: () => void;
    userId: string;
    callback?: () => void;
    _id: string;
    images?: string[];
    roomNumber?: number;
    price?: number;
    square?: number;
    isRented?: boolean;
    floor?: number;
}

export const EditRoomTitle = ({
    closeForm,
    _id: roomId,
    callback,
    images = [],
    userId,
    roomNumber,
    price,
    square,
    isRented = false,
    floor,
}: FormProps) => {
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
                        getRoomById: newData,
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
        images: false,
    });

    const [activeRoomNumber, setActiveRoomNumber] = useState(true);
    const [activePrice, setActivePrice] = useState(true);
    const [activeSquare, setActiveSquare] = useState(true);
    const [activeRented, setActiveRented] = useState(true);
    const [activeFloor, setActiveFloor] = useState(true);
    const [activeUploadImage, setActiveUploadImage] = useState(true);

    const [listDefaultImage, setListDefaultImage] = useState<Array<string>>(images);
    const [listImage, setListImage] = useState<Image[]>([]);

    const [className] = useClassName(styles);
    const scroll = useScrollController();

    useEffect(() => {
        scroll.disableScroll();

        return () => {
            scroll.enableScroll();
        };
    }, []);

    function upLoadAllFile(files: { file: File }[], id: string) {
        return Promise.all(
            files.map(async ({ file }, index) => {
                let uploadTask = null;
                const folderRef = ref(fStorage, `${id}`);
                const folderData = (await list(folderRef)).items;
                while (!uploadTask) {
                    let name = randomkey(15) + '.' + getTypeFile(file.name);
                    let storageRef = ref(fStorage, `${id}/${name}`);
                    if (folderData.length > 0 && folderData.includes(storageRef)) {
                        continue;
                    }
                    uploadTask = uploadBytesResumable(storageRef, file);
                }
                uploadTask.on('state_changed', (status) => {
                    const progressValue = (status.bytesTransferred / status.totalBytes) * 100;
                    const cloneList = listImage.slice();
                    cloneList[index].uploading = progressValue;
                    setListImage(cloneList);
                });
                return uploadTask.then((res) => {
                    return getDownloadURL(res.ref);
                });
            })
        );
    }

    const submitForm = useCallback(
        (e: UpdateRoomTitle) => {
            //#region validate
            let errorSubmit = false;
            console.log(e);
            let errorHandleForm: ErrorAction = {
                roomNumber: false,
                price: false,
                square: false,
                isRented: false,
                floor: false,
                images: false,
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
            if (activeFloor && (!e.floor || isNaN(e.floor))) {
                errorHandleForm.floor = true;
                errorSubmit = true;
            } else if (!activeFloor) {
                e.floor = undefined;
            }
            if (activeSquare && (!e.square || isNaN(e.square))) {
                errorHandleForm.square = true;
                errorSubmit = true;
            } else if (!activeSquare) {
                e.square = undefined;
            }
            if (!activeRented) {
                e.isRented = undefined;
            }
            console.log(e);
            //#endregion
            if (errorSubmit) {
                setErrorAction(errorHandleForm);
            } else {
                setUpLoading(true);
                if (activeUploadImage) {
                    upLoadAllFile(listImage, userId)
                        .then((res) => {
                            e.images = images ? [...listDefaultImage, ...res] : res;
                            updateRoom({
                                variables: updateRoomTitle.variables(e, roomId),
                            })
                                .then(() => {
                                    callback && callback();
                                    closeForm && closeForm();
                                })
                                .catch((error) => {
                                    if (e.images) {
                                        const paths = e.images.map((item) => {
                                            return getPathFileFromLink(item);
                                        });
                                        deleteAllFile(paths).catch((err) => {
                                            console.log(err);
                                        });
                                        alert(error.message);
                                        setUpLoading(false);
                                    }
                                });
                        })
                        .catch((error) => {
                            setUpLoading(false);
                            console.log(error);
                        });
                } else {
                    updateRoom({
                        variables: updateRoomTitle.variables(e, roomId),
                    })
                        .then(() => {
                            callback && callback();
                            closeForm && closeForm();
                        })
                        .catch((error) => {
                            console.log(error);
                            setUpLoading(false);
                        });
                }
            }
        },
        [
            activeRoomNumber,
            activePrice,
            activeFloor,
            activeRented,
            activeSquare,
            activeUploadImage,
            listImage,
            listDefaultImage,
        ]
    );

    const renderListDefaultImage = useMemo(() => {
        return listDefaultImage.map((item, index) => {
            return (
                <div key={index} className="image-preview__item">
                    <img src={item} alt="" />
                    <div className="image-preview__item-action">
                        <button
                            type="button"
                            onClick={() => {
                                const cloneList = listDefaultImage.filter((i) => i != item);
                                window.URL.revokeObjectURL(item);
                                setListDefaultImage(cloneList);
                            }}
                        >
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            );
        });
    }, [listDefaultImage]);

    const renderListImage = useMemo(() => {
        return listImage.map((item, index) => {
            return (
                <div key={index} className="image-preview__item">
                    <img src={item.link} alt="" />
                    {upLoading && (
                        <Progress size="xs" hasStripe value={item.uploading} colorScheme="cyan" />
                    )}
                    <div className="image-preview__item-action">
                        <button
                            type="button"
                            onClick={() => {
                                const cloneList = listImage.filter((i) => i.link != item.link);
                                window.URL.revokeObjectURL(item.link);
                                setListImage(cloneList);
                            }}
                        >
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            );
        });
    }, [listImage, upLoading]);

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
                    <div {...className('homeform-form__group')}>
                        <div>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap="5px"
                                {...className('homeform-form__label')}
                            >
                                <Checkbox
                                    isChecked={activeRoomNumber}
                                    onChange={(e) => {
                                        setActiveRoomNumber(!activeRoomNumber);
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
                                        errorAction.roomNumber && activeRoomNumber
                                            ? 'red'
                                            : 'inherit'
                                    }
                                    {...register('roomNumber', { valueAsNumber: true })}
                                    onChange={(e) => {
                                        setErrorAction({ ...errorAction, roomNumber: false });
                                        register('roomNumber', { valueAsNumber: true }).onChange(e);
                                    }}
                                    defaultValue={roomNumber}
                                    placeholder="eg: 2004"
                                    type="number"
                                />
                            </Tooltip>
                        </div>
                        <div>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap="5px"
                                {...className('homeform-form__label')}
                            >
                                <Checkbox
                                    isChecked={activePrice}
                                    onChange={(e) => {
                                        setActivePrice(!activePrice);
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
                                    borderColor={
                                        errorAction.price && activePrice ? 'red' : 'inherit'
                                    }
                                    {...register('price', { valueAsNumber: true })}
                                    onChange={(e) => {
                                        setErrorAction({ ...errorAction, price: false });
                                        register('price', { valueAsNumber: true }).onChange(e);
                                    }}
                                    defaultValue={price}
                                    placeholder="VNĐ"
                                    type="number"
                                />
                            </Tooltip>
                        </div>
                    </div>

                    <Box
                        display="flex"
                        alignItems="center"
                        gap="5px"
                        {...className('homeform-form__label')}
                    >
                        <Checkbox
                            isChecked={activeRented}
                            onChange={(e) => {
                                setActiveRented(!activeRented);
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
                        {...register('isRented')}
                        defaultValue={isRented == true ? 'true' : 'false'}
                        isDisabled={!activeRented}
                    >
                        <option value="true">Đã được cho thuê</option>
                        <option value="false">Chưa được cho thuê</option>
                    </Select>

                    <div {...className('homeform-form__group')}>
                        <div>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap="5px"
                                {...className('homeform-form__label')}
                            >
                                <Checkbox
                                    isChecked={activeFloor}
                                    onChange={(e) => {
                                        setActiveFloor(!activeFloor);
                                    }}
                                    _focus={{
                                        boxShadow: 'none',
                                    }}
                                    height="100%"
                                    colorScheme="cyan"
                                >
                                    Tầng số
                                </Checkbox>
                            </Box>
                            <Tooltip
                                label="số tầng không hợp lệ"
                                borderRadius="3px"
                                placement="bottom"
                                isDisabled={!errorAction.floor || !activeFloor}
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
                                    isDisabled={!activeFloor}
                                    borderColor={
                                        errorAction.floor && activeFloor ? 'red' : 'inherit'
                                    }
                                    {...register('floor', { valueAsNumber: true })}
                                    onChange={(e) => {
                                        setErrorAction({ ...errorAction, floor: false });
                                        register('floor', { valueAsNumber: true }).onChange(e);
                                    }}
                                    defaultValue={floor}
                                    placeholder="eg: 3"
                                    type="number"
                                />
                            </Tooltip>
                        </div>
                        <div>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap="5px"
                                {...className('homeform-form__label')}
                            >
                                <Checkbox
                                    isChecked={activeSquare}
                                    onChange={(e) => {
                                        setActiveSquare(!activeSquare);
                                    }}
                                    _focus={{
                                        boxShadow: 'none',
                                    }}
                                    height="100%"
                                    colorScheme="cyan"
                                >
                                    Diện tích phòng
                                </Checkbox>
                            </Box>
                            <Tooltip
                                label="diện tích phòng không hợp lệ"
                                borderRadius="3px"
                                placement="bottom"
                                isDisabled={!errorAction.square || !activeSquare}
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
                                    isDisabled={!activeSquare}
                                    borderColor={
                                        errorAction.square && activeSquare ? 'red' : 'inherit'
                                    }
                                    {...register('square', { valueAsNumber: true })}
                                    onChange={(e) => {
                                        setErrorAction({ ...errorAction, square: false });
                                        register('square', { valueAsNumber: true }).onChange(e);
                                    }}
                                    defaultValue={square}
                                    placeholder="m2"
                                    type="number"
                                />
                            </Tooltip>
                        </div>
                    </div>

                    <Box
                        display="flex"
                        alignItems="center"
                        gap="5px"
                        {...className('homeform-form__label')}
                    >
                        <Checkbox
                            isChecked={activeUploadImage}
                            onChange={(e) => {
                                setActiveUploadImage((prev) => !prev);
                            }}
                            _focus={{
                                boxShadow: 'none',
                            }}
                            height="100%"
                            colorScheme="cyan"
                        >
                            Ảnh phòng (tối đa 6)
                        </Checkbox>
                    </Box>
                    <div className="addhome-form__upload">
                        <div className="image-preview">
                            {renderListDefaultImage}
                            {activeUploadImage && renderListImage}
                            <Tooltip
                                label="Cần tải lên ít nhất 2 ảnh của phòng"
                                borderRadius="3px"
                                placement="bottom"
                                isDisabled={!errorAction.images}
                                bg="red"
                                hasArrow
                            >
                                <Button
                                    variant="link"
                                    _hover={{
                                        textDecoration: 'none',
                                    }}
                                    _focus={{
                                        boxShadow: 'none',
                                    }}
                                    width="70px"
                                    height="70px"
                                    borderRadius="1px"
                                    className="image-preview__btn"
                                    style={{
                                        ...(listDefaultImage.length + listImage.length > 5
                                            ? {
                                                  display: 'none',
                                              }
                                            : {}),
                                    }}
                                    borderColor={
                                        errorAction.images && activeUploadImage ? 'red' : 'inherit'
                                    }
                                    isDisabled={!activeUploadImage}
                                    onClick={() => {
                                        const input = document.getElementById('upload');
                                        if (input) {
                                            input.click();
                                        }
                                    }}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Tải lên
                                </Button>
                            </Tooltip>
                        </div>

                        <input
                            type="file"
                            id="upload"
                            style={{
                                display: 'none',
                            }}
                            multiple
                            onChange={(e) => {
                                setErrorAction({ ...errorAction, images: false });
                                if (e.target.files?.length && e.target.files[0]) {
                                    const listImg = listImage.slice();
                                    console.log(listImage, e.target.files);
                                    for (let i = 0; i < e.target.files.length; i++) {
                                        const image = e.target.files[i];
                                        if (
                                            !image ||
                                            listDefaultImage.length + listImg.length > 5
                                        ) {
                                            break;
                                        }
                                        const isHasImage = !!listImage.find(
                                            (value) => value.file.name === image.name
                                        );
                                        if (!isHasImage) {
                                            const url = window.URL.createObjectURL(image);
                                            listImg.push({
                                                file: image,
                                                link: url,
                                                uploading: 0,
                                            });
                                        }
                                    }
                                    setListImage(listImg);
                                    e.target.value = '';
                                }
                            }}
                            accept="image/*"
                        />
                    </div>
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
                                !activePrice &&
                                !activeRented &&
                                !activeSquare &&
                                !activeFloor &&
                                !activeUploadImage
                            }
                            _focus={{
                                boxShadow: 'none',
                            }}
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
