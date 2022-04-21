import styles from '../styles/style.module.scss';
import {
    Box,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    Progress,
    Select,
    Tooltip,
} from '@chakra-ui/react';
import { motion, Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import useClassName from '../../../lib/useClassName';
import { HomeLocation, updateHomeLocation } from '../../../lib/apollo/home/update';
import { getHomeById } from '../../../lib/apollo/home/gethomebyid';
import { HomeData } from '../../../pages/home/[homeid]';
import { Checkbox } from '@chakra-ui/checkbox';
import useScrollController from '../../../lib/useScrollController';
import FormLocation from '../../location';
import MapBox, { MapField } from '../../mapbox';
import { Image } from '../addhome';
import { getDownloadURL, list, ref, uploadBytesResumable } from 'firebase/storage';
import { fStorage } from '../../../firebase';
import randomkey, { getTypeFile } from '../../../lib/randomkey';
import { User } from '../../../lib/withAuth';
import { deleteAllFile, getPathFileFromLink } from '../../../lib/upLoadAllFile';

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

const hideFormAnimate: Variants = {
    showForm: {
        x: '0',
    },
    hiddenForm: {
        x: '-120%',
    },
};

interface ErrorAction {
    province: boolean;
    district: boolean;
    ward: boolean;
    liveWithOwner: boolean;
    position: boolean;
    images: boolean;
}

interface FormProps {
    closeForm: () => void;
    homeId: string;
    callback?: () => void;
    images?: string[];
    user: User;
}

const EditHomeLocation = ({ closeForm, homeId, callback, images, user }: FormProps) => {
    const mount = useRef(false);
    const [updateHome, { data }] = useMutation(updateHomeLocation.command, {
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
            callback && callback();
            // setUpLoading(false);
            closeForm();
            // console.log(client)
        },
    });
    const { register, handleSubmit, watch } = useForm<HomeLocation>();
    const [errorAction, setErrorAction] = useState<ErrorAction>({
        province: false,
        district: false,
        ward: false,
        liveWithOwner: false,
        position: false,
        images: false,
    });

    const [listImage, setListImage] = useState<Image[]>([]);
    const [upLoading, setUpLoading] = useState(false);

    const [showMap, setShowMap] = useState(false);
    const [mapData, setMapData] = useState<MapField | null>(null);
    const [prevMapData, setPrevMapData] = useState<MapField | null>(null);

    const provinceField = watch('province');
    const districtField = watch('district');
    const wardField = watch('ward');

    useEffect(() => {
        setErrorAction({ ...errorAction, province: false });
    }, [provinceField]);

    useEffect(() => {
        setErrorAction({ ...errorAction, district: false });
    }, [districtField]);

    useEffect(() => {
        setErrorAction({ ...errorAction, ward: false });
    }, [wardField]);

    useEffect(() => {
        if (mapData) {
            setErrorAction({ ...errorAction, position: false });
        }
    }, [mapData]);

    const mapSetProvince = useMemo(() => {
        if (prevMapData?.center) {
            return { center: prevMapData.center };
        }
        const province = provinceField;
        const district = districtField;
        const ward = wardField;
        if (ward && !isNaN(ward)) {
            return district && !isNaN(district) ? { province, district, ward } : {};
        }
        if (district && !isNaN(district)) {
            return province && !isNaN(province) ? { province, district } : {};
        }
        return province && !isNaN(province) ? { province } : {};
    }, [provinceField, districtField, wardField, prevMapData]);

    const [activeLocation, setActiveLocation] = useState(true);
    const [activeLiveWithOwner, setActiveLiveWithOwner] = useState(true);
    const [activeUploadImage, setActiveUploadImage] = useState(true);

    const [className] = useClassName(styles);
    const scroll = useScrollController();

    useEffect(() => {
        scroll.disableScroll();

        return () => {
            scroll.enableScroll();
        };
    }, []);

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
                            <i className="fi fi-br-trash"></i>
                        </button>
                    </div>
                </div>
            );
        });
    }, [listImage, upLoading]);

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
        (e: HomeLocation) => {
            let errorSubmit = false;
            console.log(e);
            let errorHandleForm: ErrorAction = {
                province: false,
                district: false,
                ward: false,
                liveWithOwner: false,
                position: false,
                images: false,
            };

            if (activeLocation) {
                if ((e.province && !isNaN(e.province)) || !e.province) {
                    errorHandleForm.province = true;
                    errorSubmit = true;
                }
                if ((e.district && !isNaN(e.district)) || !e.district) {
                    errorHandleForm.district = true;
                    errorSubmit = true;
                }
                if ((e.ward && !isNaN(e.ward)) || !e.ward) {
                    errorHandleForm.ward = true;
                    errorSubmit = true;
                }
                if (!mapData) {
                    errorHandleForm.position = true;
                    errorSubmit = true;
                }
            } else {
                e.district = undefined;
                e.province = undefined;
                e.ward = undefined;
            }

            if (!activeLiveWithOwner) {
                e.liveWithOwner = undefined;
            } else {
                e.liveWithOwner = e.liveWithOwner == 'true' ? true : false;
            }

            if (activeUploadImage && listImage.length == 0) {
                errorHandleForm.images = true;
                errorSubmit = true;
            } else if (!activeUploadImage) {
                e.images = undefined;
            }

            if (errorSubmit) {
                setErrorAction(errorHandleForm);
            } else {
                setUpLoading(true);
                if (activeUploadImage) {
                    upLoadAllFile(listImage, user?._id!)
                        .then((res) => {
                            e.images = images ? [...images, ...res] : res;
                            updateHome({
                                variables: updateHomeLocation.variables(e, homeId),
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
                    updateHome({
                        variables: updateHomeLocation.variables(e, homeId),
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
        [images, activeLocation, activeLiveWithOwner, activeUploadImage, mapData, listImage]
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
                style={{
                    overflowX: 'hidden',
                }}
                variants={formAnimate}
                initial="hidden"
                animate="show"
                exit="hidden"
            >
                <motion.form
                    variants={hideFormAnimate}
                    animate={showMap ? 'hiddenForm' : 'showForm'}
                    transition={{
                        duration: 0.5,
                    }}
                    onSubmit={handleSubmit(submitForm)}
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="5px"
                        {...className('homeform-form__label')}
                    >
                        <Checkbox
                            isChecked={activeLocation}
                            onChange={(e) => {
                                setActiveLocation((prev) => !prev);
                            }}
                            _focus={{
                                boxShadow: 'none',
                            }}
                            height="100%"
                            colorScheme="cyan"
                        >
                            Địa chỉ
                        </Checkbox>
                    </Box>
                    <div className="addhome-form__location">
                        <FormLocation
                            provinceField={register('province')}
                            districtField={register('district')}
                            wardField={register('ward')}
                            errorEvent={errorAction}
                            disable={!activeLocation}
                        />
                    </div>
                    <Tooltip
                        label="Vui lòng chọn địa điểm trên bản đồ"
                        borderRadius="3px"
                        isDisabled={!errorAction.position || !activeLocation}
                        placement="bottom"
                        bg="red"
                        hasArrow
                    >
                        <InputGroup className="addhome-form__map">
                            <Input
                                height="50px"
                                borderWidth="3px"
                                readOnly
                                placeholder="Vị trí cụ thể"
                                cursor="pointer"
                                onClick={() => setShowMap(true)}
                                isDisabled={!activeLocation}
                                borderColor={
                                    errorAction.position && activeLocation ? 'red' : 'inherit'
                                }
                                _focus={{
                                    outline: 'none',
                                    borderColor: '#80befc',
                                }}
                                value={mapData ? mapData.place_name : ''}
                            />
                            <InputRightElement>
                                <a onClick={() => setShowMap(true)}>{'>'}</a>
                            </InputRightElement>
                        </InputGroup>
                    </Tooltip>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap="5px"
                        {...className('homeform-form__label')}
                    >
                        <Checkbox
                            isChecked={activeLiveWithOwner}
                            onChange={(e) => {
                                setActiveLiveWithOwner((prev) => !prev);
                            }}
                            _focus={{
                                boxShadow: 'none',
                            }}
                            height="100%"
                            colorScheme="cyan"
                        >
                            Hình thức sinh hoạt
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
                        {...register('liveWithOwner')}
                        defaultValue="false"
                        isDisabled={!activeLiveWithOwner}
                    >
                        <option value="true">Sống với chủ trọ</option>
                        <option value="false">Không sống với chủ trọ</option>
                    </Select>
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
                                        ...(listImage.length > 5
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
                                    <i className="fi fi-br-plus"></i>
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
                        <Button
                            /* isDisabled={
                                !activeElectricityPrice &&
                                !activeWaterPrice &&
                                !activeInternetPrice &&
                                !activeCleaningPrice
                            } */
                            isDisabled={
                                !activeLocation && !activeLiveWithOwner && !activeUploadImage
                            }
                            isLoading={upLoading}
                            type="submit"
                            colorScheme="red"
                        >
                            Cập nhật
                        </Button>
                    </div>
                </motion.form>
                {showMap && (
                    <motion.div
                        initial={{
                            x: '120%',
                        }}
                        animate={{
                            x: '0',
                        }}
                        transition={{
                            duration: 0.5,
                        }}
                        className="addhome-form__mapbox"
                    >
                        <MapBox
                            delay={1000}
                            district={0}
                            onChange={setMapData}
                            {...mapSetProvince}
                        />
                        <div>
                            <Button
                                onClick={() => {
                                    setShowMap(false);
                                    setMapData(prevMapData);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowMap(false);
                                    setPrevMapData(mapData);
                                }}
                                colorScheme="red"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default EditHomeLocation;
