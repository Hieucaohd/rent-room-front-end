import { useMutation } from '@apollo/client';
import {
    Button,
    Input,
    InputGroup,
    InputRightElement,
    Progress,
    Select,
    Text,
    Tooltip,
    useToast,
} from '@chakra-ui/react';
import { getDownloadURL, list, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { motion, Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { fStorage } from '@firebase';
import { createNewHome, NewHome } from '@lib/apollo/home';
import useScrollController from '@lib/useScrollController';
import randomkey, { getTypeFile } from '@lib/randomkey';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';
import useStore from '@store/useStore';
import FormLocation from '../../location';
import MapBox, { MapField } from '../../mapbox';

interface AddHomeProps {
    onClose?: () => any;
    afterUpload?: () => any;
}

const container: Variants = {
    show: {
        opacity: 1,
    },
    hidden: {
        opacity: 0,
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
    province: boolean;
    district: boolean;
    ward: boolean;
    liveWithOwner: boolean;
    electricityPrice: boolean;
    waterPrice: boolean;
    images: boolean;
    totalRooms: boolean;
    position: boolean;
}

export interface Image {
    file: File;
    link: string;
    uploading: number;
}

export default function AddHome(props: AddHomeProps) {
    const mount = useRef(false);
    const scroll = useScrollController();
    const { register, handleSubmit, watch } = useForm<NewHome>();
    const { info: user } = useStore((state) => state.user);
    const [upLoading, setUpLoading] = useState(false);
    const [createHome] = useMutation(createNewHome.command);
    const [listImage, setListImage] = useState<Image[]>([]);
    const [showMap, setShowMap] = useState(false);
    const [mapData, setMapData] = useState<MapField | null>(null);
    const [prevMapData, setPrevMapData] = useState<MapField | null>(null);

    const provinceField = watch('province');
    const districtField = watch('district');
    const wardField = watch('ward');

    const toast = useToast();

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
        setErrorAction({ ...errorAction, position: false });
    }, [mapData]);

    const [errorAction, setErrorAction] = useState<ErrorAction>({
        province: false,
        district: false,
        ward: false,
        liveWithOwner: false,
        electricityPrice: false,
        waterPrice: false,
        images: false,
        totalRooms: false,
        position: false,
    });

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
        mount.current = true;
        scroll.disableScroll();

        return () => {
            mount.current = false;
            scroll.enableScroll();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (!mount.current) {
                listImage.forEach((item) => {
                    window.URL.revokeObjectURL(item.link);
                });
            }
        };
    }, [listImage]);

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
        async (e: NewHome) => {
            let hasError = false;
            const error: ErrorAction = {
                province: false,
                district: false,
                ward: false,
                liveWithOwner: false,
                electricityPrice: false,
                waterPrice: false,
                images: false,
                totalRooms: false,
                position: false,
            };
            if (e.district == '') {
                error.district = true;
                hasError = true;
            } else {
                e.district = parseInt(e.district);
            }
            if (listImage.length < 2) {
                error.images = true;
                hasError = true;
            }
            if (e.province == '') {
                error.province = true;
                hasError = true;
            } else {
                e.province = parseInt(e.province);
            }
            if (e.ward == '') {
                error.ward = true;
                hasError = true;
            } else {
                e.ward = parseInt(e.ward);
            }
            if (e.electricityPrice == '') {
                error.electricityPrice = true;
                hasError = true;
            } else {
                e.electricityPrice = parseInt(e.electricityPrice);
            }
            if (e.waterPrice == '') {
                error.waterPrice = true;
                hasError = true;
            } else {
                e.waterPrice = parseInt(e.waterPrice);
            }
            if (!mapData || !mapData.center || !mapData.center[0] || !mapData.center[1]) {
                error.position = true;
                hasError = true;
            }
            if (e.liveWithOwner == 'true') {
                e.liveWithOwner = true;
            } else {
                e.liveWithOwner = false;
            }
            if (hasError || !mapData) {
                setErrorAction(error);
            } else {
                setUpLoading(true);
                upLoadAllFile(listImage, user?._id!)
                    .then((res) => {
                        e.images = res;
                        createHome({
                            variables: createNewHome.variable(e, mapData.center),
                        })
                            .then(() => {
                                props.afterUpload && props.afterUpload();
                                toast({
                                    title: `Thêm trọ thành công`,
                                    position: 'bottom-left',
                                    status: 'success',
                                    isClosable: true,
                                });
                                props.onClose && props.onClose();
                            })
                            .catch((error) => {
                                const paths = e.images.map((item) => {
                                    return getPathFileFromLink(item);
                                });
                                deleteAllFile(paths).catch((err) => {
                                    console.log(err);
                                });
                                toast({
                                    title: `Server timeout`,
                                    position: 'bottom-left',
                                    status: 'error',
                                    isClosable: true,
                                });
                                setUpLoading(false);
                            });
                    })
                    .catch((error) => {
                        setUpLoading(false);
                        console.log(error);
                    });
                /*  */
            }
        },
        [listImage, prevMapData]
    );

    const mapSetProvince = useMemo(() => {
        if (prevMapData?.center) {
            return { center: prevMapData.center };
        }
        const province = parseInt(provinceField);
        const district = parseInt(districtField);
        const ward = parseInt(wardField);
        if (ward && !isNaN(ward)) {
            return district && !isNaN(district) ? { province, district, ward } : {};
        }
        if (district && !isNaN(district)) {
            return province && !isNaN(province) ? { province, district } : {};
        }
        return province && !isNaN(province) ? { province } : {};
    }, [provinceField, districtField, wardField, prevMapData]);

    return (
        <>
            <motion.div
                className="addhome"
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
            >
                <motion.div className="addhome__bg"></motion.div>
                <motion.div
                    variants={formAnimate}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="addhome-form"
                >
                    <motion.form
                        variants={hideFormAnimate}
                        animate={showMap ? 'hiddenForm' : 'showForm'}
                        transition={{
                            duration: 0.5,
                        }}
                        onSubmit={handleSubmit(submitForm)}
                    >
                        <Text className="addhome-form__label">
                            Địa chỉ trọ<span> *</span>
                        </Text>
                        <div className="addhome-form__location">
                            <FormLocation
                                provinceField={register('province')}
                                districtField={register('district')}
                                wardField={register('ward')}
                                errorEvent={errorAction}
                            />
                        </div>
                        <Tooltip
                            label="Vui lòng chọn địa điểm trên bản đồ"
                            borderRadius="3px"
                            isDisabled={!errorAction.position}
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
                                    {...(errorAction.position ? { borderColor: 'red' } : {})}
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
                        >
                            <option value="true">Sống với chủ trọ</option>
                            <option value="false">Không sống với chủ trọ</option>
                        </Select>
                        <Text className="addhome-form__label">
                            Tiền điện (VNĐ)<span> *</span>
                        </Text>
                        <Tooltip
                            label="Bạn chưa nhập giá tiền điện"
                            borderRadius="3px"
                            placement="bottom"
                            isDisabled={!errorAction.electricityPrice}
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
                                borderColor={errorAction.electricityPrice ? 'red' : 'inherit'}
                                {...register('electricityPrice')}
                                onChange={(e) => {
                                    setErrorAction({ ...errorAction, electricityPrice: false });
                                    register('electricityPrice').onChange(e);
                                }}
                                placeholder="electricity price"
                                type="number"
                            />
                        </Tooltip>
                        <Text className="addhome-form__label">
                            Tiền nước (VNĐ)<span> *</span>
                        </Text>
                        <Tooltip
                            label="Bạn chưa nhập giá tiền nước"
                            borderRadius="3px"
                            placement="bottom"
                            isDisabled={!errorAction.waterPrice}
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
                                borderColor={errorAction.waterPrice ? 'red' : 'inherit'}
                                {...register('waterPrice')}
                                onChange={(e) => {
                                    setErrorAction({ ...errorAction, waterPrice: false });
                                    register('waterPrice').onChange(e);
                                }}
                                placeholder="water price"
                                type="number"
                            />
                        </Tooltip>
                        <Text className="addhome-form__label">
                            Ảnh trọ (tối đa 6)<span> *</span>
                        </Text>
                        <div className="addhome-form__upload">
                            <div className="image-preview">
                                {renderListImage}
                                <Tooltip
                                    label="Cần tải lên ít nhất 2 ảnh của trọ"
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
                            <Button onClick={() => (props.onClose ? props.onClose() : null)}>
                                Hủy
                            </Button>
                            <Button isLoading={upLoading} type="submit" colorScheme="red">
                                Thêm
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
        </>
    );
}
