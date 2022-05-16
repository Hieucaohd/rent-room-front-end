import styles from './addzoom.module.scss';
import { Button, Input, Progress, Text, Tooltip, useBoolean } from '@chakra-ui/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image } from '..';
import { getDownloadURL, list, ref, uploadBytesResumable } from 'firebase/storage';
import randomkey, { getTypeFile } from '@lib/randomkey';
import { fStorage } from '@firebase';
import { useForm } from 'react-hook-form';
import { AddZoomForm, createZoom } from '@lib/apollo/home/room';
import { useMutation } from '@apollo/client';
import { User } from '@lib/withAuth';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';
import useClassName from '@lib/useClassName';

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
    price: boolean;
    square: boolean;
    floor: boolean;
    zoomnumber: boolean;
    images: boolean;
}

interface FormProps {
    closeForm: () => void;
    homeId: string;
    user: User;
    callback?: () => Promise<any>;
}

const Form = ({ closeForm, homeId, user, callback }: FormProps) => {
    const mount = useRef(false);
    const [createNewZoom] = useMutation(createZoom.command);
    const { register, handleSubmit } = useForm<AddZoomForm>();
    const [listImage, setListImage] = useState<Image[]>([]);
    const [upLoading, setUpLoading] = useState(false);
    const [errorAction, setErrorAction] = useState<ErrorAction>({
        price: false,
        square: false,
        floor: false,
        zoomnumber: false,
        images: false,
    });

    const [className] = useClassName(styles);

    useEffect(() => {
        mount.current = true;
        return () => {
            mount.current = false;
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

    useEffect(() => {
        return () => {
            if (!mount.current) {
                listImage.forEach((item) => {
                    window.URL.revokeObjectURL(item.link);
                });
            }
        };
    }, [listImage]);

    const submitForm = useCallback(
        (e: AddZoomForm) => {
            let errorSubmit = false;
            console.log(e);
            let errorHandleForm: ErrorAction = {
                price: false,
                square: false,
                floor: false,
                zoomnumber: false,
                images: false,
            };
            if (isNaN(e.square)) {
                errorHandleForm.square = true;
                errorSubmit = true;
            }
            if (isNaN(e.floor)) {
                errorHandleForm.floor = true;
                errorSubmit = true;
            }
            if (isNaN(e.price)) {
                errorHandleForm.price = true;
                errorSubmit = true;
            }
            if (isNaN(e.zoomnumber)) {
                errorHandleForm.zoomnumber = true;
                errorSubmit = true;
            }
            if (errorSubmit) {
                setErrorAction(errorHandleForm);
            } else {
                setUpLoading(true);
                upLoadAllFile(listImage, user._id + '/' + homeId).then((res) => {
                    e.images = res;
                    createNewZoom({
                        variables: createZoom.variables(e, homeId),
                    })
                        .then(() => {
                            callback && callback();
                            closeForm();
                        })
                        .catch((error) => {
                            const paths = e.images.map((item) => {
                                return getPathFileFromLink(item);
                            });
                            deleteAllFile(paths).catch((err) => {
                                console.log(err);
                            });
                            setUpLoading(false);
                            console.log(error);
                        });
                });
            }
        },
        [listImage]
    );

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            {...className('addzoom')}
        >
            <div {...className('addzoom__bg')}></div>
            <motion.div
                {...className('addzoom-form')}
                variants={formAnimate}
                initial="hidden"
                animate="show"
                exit="hidden"
            >
                <form onSubmit={handleSubmit(submitForm)}>
                    <Text {...className('addzoom-form__h1')}>Thêm phòng</Text>
                    <Text {...className('addzoom-form__label')}>
                        Phòng số <span>*</span>
                    </Text>
                    <Tooltip
                        label="mã số phòng không hợp lệ"
                        borderRadius="3px"
                        placement="bottom"
                        isDisabled={!errorAction.zoomnumber}
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
                            borderColor={errorAction.zoomnumber ? 'red' : 'inherit'}
                            {...register('zoomnumber', { valueAsNumber: true })}
                            onChange={(e) => {
                                setErrorAction({ ...errorAction, zoomnumber: false });
                                register('zoomnumber', { valueAsNumber: true }).onChange(e);
                            }}
                            placeholder="eg: 2104"
                            type="number"
                        />
                    </Tooltip>
                    <Text {...className('addzoom-form__label')}>
                        Tiền phòng <span>*</span>
                    </Text>
                    <Tooltip
                        label="bạn chưa nhập giá tiền phòng"
                        borderRadius="3px"
                        placement="bottom"
                        isDisabled={!errorAction.price}
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
                            borderColor={errorAction.price ? 'red' : 'inherit'}
                            {...register('price', { valueAsNumber: true })}
                            onChange={(e) => {
                                setErrorAction({ ...errorAction, price: false });
                                register('price', { valueAsNumber: true }).onChange(e);
                            }}
                            placeholder="VNĐ"
                            type="number"
                        />
                    </Tooltip>
                    <Text {...className('addzoom-form__label')}>
                        Diện tích <span>*</span>
                    </Text>
                    <Tooltip
                        label="Bạn chưa nhập diện tích phòng"
                        borderRadius="3px"
                        placement="bottom"
                        isDisabled={!errorAction.square}
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
                            borderColor={errorAction.square ? 'red' : 'inherit'}
                            {...register('square', { valueAsNumber: true })}
                            onChange={(e) => {
                                setErrorAction({ ...errorAction, square: false });
                                register('square').onChange(e);
                            }}
                            placeholder="m2"
                            type="number"
                        />
                    </Tooltip>
                    <Text {...className('addzoom-form__label')}>
                        Tầng số <span>*</span>
                    </Text>
                    <Tooltip
                        label="Bạn chưa nhập vị trí phòng"
                        borderRadius="3px"
                        placement="bottom"
                        isDisabled={!errorAction.floor}
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
                            borderColor={errorAction.floor ? 'red' : 'inherit'}
                            {...register('floor', { valueAsNumber: true })}
                            onChange={(e) => {
                                setErrorAction({ ...errorAction, floor: false });
                                register('floor').onChange(e);
                            }}
                            placeholder="floor"
                            type="number"
                        />
                    </Tooltip>
                    <Text {...className('addzoom-form__label')}>
                        Ảnh phòng (tối đa 6)<span> *</span>
                    </Text>
                    <div className="addhome-form__upload">
                        <div className="image-preview">
                            {renderListImage}
                            <Tooltip
                                label="Cần tải lên ít nhất 2 ảnh của phòng"
                                borderRadius="3px"
                                placement="bottom"
                                isDisabled={!errorAction.images}
                                bg="red"
                                hasArrow
                            >
                                <motion.div
                                    className="image-preview__btn"
                                    style={{
                                        ...(listImage.length > 5
                                            ? {
                                                  display: 'none',
                                              }
                                            : {}),
                                        ...(errorAction.images ? { borderColor: 'red' } : {}),
                                    }}
                                    onClick={() => {
                                        const input = document.getElementById('upload');
                                        if (input) {
                                            input.click();
                                        }
                                    }}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Tải lên
                                </motion.div>
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
                                        if (!image || listImg.length > 5) {
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
                        <Button isLoading={upLoading} type="submit" colorScheme="red">
                            Thêm
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function AddZoom({
    homeId,
    user,
    callback,
}: {
    homeId: string;
    user: User;
    callback?: () => Promise<any>;
}) {
    const [isOpen, setOpen] = useBoolean();

    return (
        <>
            <Button onClick={setOpen.on}>
                <i className="fa-solid fa-plus"></i>Add Zoom
            </Button>
            <AnimatePresence>
                {isOpen && (
                    <Form closeForm={setOpen.off} callback={callback} homeId={homeId} user={user} />
                )}
            </AnimatePresence>
        </>
    );
}
