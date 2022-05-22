import styles from '../styles/style.module.scss';
import {
    Box,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Progress,
    Select,
    Tooltip,
    useToast,
} from '@chakra-ui/react';
import { motion, Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import useClassName from '@lib/useClassName';
import { HomeLocation, updateHomeLocation } from '@lib/apollo/home/update';
import { getHomeById } from '@lib/apollo/home/gethomebyid';
import { Checkbox } from '@chakra-ui/checkbox';
import FormLocation from '../../location';
import MapBox, { MapField } from '../../mapbox';
import { Image } from '../addhome';
import { getDownloadURL, list, ref, uploadBytesResumable } from 'firebase/storage';
import { fStorage } from '@firebase';
import randomkey, { getTypeFile } from '@lib/randomkey';
import { User } from '@lib/withAuth';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';
import { HomeData } from '@lib/interface';
import { getListExitPosition } from '@lib/getPosition';
import useResize from '@lib/use-resize';

const hideFormAnimate: Variants = {
    showForm: {
        x: '0',
    },
    hiddenForm: {
        x: '-120%',
    },
};

interface ErrorAction {
    title: boolean;
    province: boolean;
    district: boolean;
    ward: boolean;
    liveWithOwner: boolean;
    position: boolean;
    images: boolean;
}

interface FormProps {
    closeForm: () => void;
    callback?: () => void;
    images?: string[];
    user: User;
    _id: string;
    title?: string;
    province?: number;
    district?: number;
    ward?: number;
    liveWithOwner?: boolean;
    position?: {
        lng: number;
        lat: number;
    };
}

const EditHomeLocation = ({
    closeForm,
    _id: homeId,
    images = [],
    title,
    province,
    district,
    ward,
    liveWithOwner,
    position,
    callback,
    user,
}: FormProps) => {
    const toast = useToast();
    const [mobilemode] = useResize(500);
    const [updateHome] = useMutation(updateHomeLocation.command, {
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
    const [isOpen, setOpen] = useState(false);
    const { register, handleSubmit, watch, getValues } = useForm<HomeLocation>();
    const [errorAction, setErrorAction] = useState<ErrorAction>({
        title: false,
        province: false,
        district: false,
        ward: false,
        liveWithOwner: false,
        position: false,
        images: false,
    });

    const [listDefaultImage, setListDefaultImage] = useState<Array<string>>(images);
    const [listImage, setListImage] = useState<Image[]>([]);
    const [upLoading, setUpLoading] = useState(false);

    const [showMap, setShowMap] = useState(false);
    const [mapData, setMapData] = useState<MapField | null>(
        position
            ? {
                  center: [position.lng, position.lat],
                  place_name: '',
              }
            : null
    );
    const [prevMapData, setPrevMapData] = useState<MapField | null>(
        position
            ? {
                  center: [position.lng, position.lat],
                  place_name: '',
              }
            : null
    );

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

    const [activeTitle, setActiveTitle] = useState(true);
    const [activeLocation, setActiveLocation] = useState(true);
    const [activeLiveWithOwner, setActiveLiveWithOwner] = useState(true);
    const [activeUploadImage, setActiveUploadImage] = useState(true);
    const [listLocation, setListLocation] = useState<[any[], any[], any[]]>([[], [], []]);

    const [className] = useClassName(styles);

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

    const isHaveLocation = province && district && ward;

    useEffect(() => {
        if (isHaveLocation) {
            getListExitPosition(province, district).then((res) => {
                setListLocation(res);
                setOpen(true);
            });
        } else {
            setOpen(true);
        }
    }, [province, district, ward]);

    const submitForm = useCallback(
        (e: HomeLocation) => {
            let errorSubmit = false;
            // console.log(e);
            let errorHandleForm: ErrorAction = {
                title: false,
                province: false,
                district: false,
                ward: false,
                liveWithOwner: false,
                position: false,
                images: false,
            };

            if (activeTitle && e.title == '') {
                errorHandleForm.title = true;
                errorSubmit = true;
            }
            // console.log(e.title);

            if (activeLocation) {
                e.province = parseInt(e.province);
                e.district = parseInt(e.district);
                e.ward = parseInt(e.ward);
                if (isNaN(e.province)) {
                    errorHandleForm.province = true;
                    errorSubmit = true;
                }
                if (isNaN(e.district)) {
                    errorHandleForm.district = true;
                    errorSubmit = true;
                }
                if (isNaN(e.ward)) {
                    errorHandleForm.ward = true;
                    errorSubmit = true;
                }
                if (!mapData || !mapData.center || !mapData.center[0] || !mapData.center[1]) {
                    errorHandleForm.position = true;
                    errorSubmit = true;
                } else {
                    e.position = {
                        lng: mapData.center[0],
                        lat: mapData.center[1],
                        x: 0,
                        y: 0,
                    };
                }
            } else {
                e.district = undefined;
                e.province = undefined;
                e.ward = undefined;
                e.position = undefined;
            }

            if (!activeLiveWithOwner) {
                e.liveWithOwner = undefined;
            } else {
                e.liveWithOwner = e.liveWithOwner == 'true' ? true : false;
            }

            if (!activeUploadImage) {
                e.images = undefined;
            }

            if (errorSubmit) {
                setErrorAction(errorHandleForm);
            } else {
                setUpLoading(true);
                if (activeUploadImage) {
                    upLoadAllFile(listImage, user?._id!)
                        .then((res) => {
                            e.images = images ? [...listDefaultImage, ...res] : res;
                            updateHome({
                                variables: updateHomeLocation.variables(e, homeId),
                            })
                                .then(() => {
                                    toast({
                                        title: 'Cập nhật trọ thành công',
                                        status: 'success',
                                        position: 'bottom-left',
                                        isClosable: true,
                                    });
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
                                        toast({
                                            title: 'Đã có lỗi xảy ra',
                                            status: 'error',
                                            position: 'bottom-left',
                                            isClosable: true,
                                        });
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
        [
            images,
            activeLocation,
            activeLiveWithOwner,
            activeUploadImage,
            activeTitle,
            mapData,
            listImage,
            provinceField,
            districtField,
            wardField,
        ]
    );

    return (
        <>
            <Modal
                onClose={closeForm}
                isOpen={isOpen}
                scrollBehavior="outside"
                {...(mobilemode ? { size: 'full' } : {})}
            >
                <ModalOverlay overflowY="scroll" />
                <ModalContent maxWidth="500px" {...(mobilemode ? { borderRadius: 0 } : {})}>
                    <ModalHeader>Thông tin trọ</ModalHeader>
                    <ModalCloseButton tabIndex={-1} />
                    <ModalBody>
                        <Box className="addhome-form">
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
                                        isChecked={activeTitle}
                                        onChange={(e) => {
                                            setActiveTitle((prev) => !prev);
                                        }}
                                        _focus={{
                                            boxShadow: 'none',
                                        }}
                                        height="100%"
                                        colorScheme="cyan"
                                    >
                                        Tên trọ
                                    </Checkbox>
                                </Box>
                                <Tooltip
                                    label="Bạn chưa nhập tên trọ mới"
                                    borderRadius="3px"
                                    placement="bottom"
                                    isDisabled={!errorAction.title || !activeTitle}
                                    bg="red"
                                    hasArrow
                                >
                                    <Input
                                        height="50px"
                                        borderWidth="3px"
                                        _focus={{
                                            outline: 'none',
                                            borderColor: '#80befc',
                                        }}
                                        isDisabled={!activeTitle}
                                        borderColor={
                                            errorAction.title && activeTitle ? 'red' : 'inherit'
                                        }
                                        {...register('title')}
                                        onChange={(e) => {
                                            setErrorAction({ ...errorAction, title: false });
                                            register('title').onChange(e);
                                        }}
                                        defaultValue={title}
                                        placeholder="name"
                                        type="text"
                                    />
                                </Tooltip>
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
                                        {...(isHaveLocation
                                            ? {
                                                  defaultValue: {
                                                      value: {
                                                          province: province,
                                                          district: district,
                                                          ward: ward,
                                                      },
                                                      list: listLocation,
                                                  },
                                              }
                                            : {})}
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
                                                errorAction.position && activeLocation
                                                    ? 'red'
                                                    : 'inherit'
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
                                    defaultValue={liveWithOwner == true ? 'true' : 'false'}
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
                                                    ...(listDefaultImage.length + listImage.length >
                                                    5
                                                        ? {
                                                              display: 'none',
                                                          }
                                                        : {}),
                                                }}
                                                borderColor={
                                                    errorAction.images && activeUploadImage
                                                        ? 'red'
                                                        : 'inherit'
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
                                                        const url =
                                                            window.URL.createObjectURL(image);
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
                                </motion.div>
                            )}
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        {!showMap ? (
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
                                        !activeTitle &&
                                        !activeLocation &&
                                        !activeLiveWithOwner &&
                                        !activeUploadImage
                                    }
                                    onClick={() => {
                                        const data = getValues();
                                        submitForm(data);
                                    }}
                                    isLoading={upLoading}
                                    type="submit"
                                    colorScheme="red"
                                    _focus={{
                                        boxShadow: 'none',
                                    }}
                                >
                                    Cập nhật
                                </Button>
                            </div>
                        ) : (
                            <div className="addhome-form__submit">
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
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export { EditHomeLocation };
