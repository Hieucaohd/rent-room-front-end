import styles from '../styles/style.module.scss';
import {
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
    Textarea,
    useToast,
} from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import useClassName from '@lib/useClassName';
import { updateHomeDescription } from '@lib/apollo/home/update';
import { getHomeById } from '@lib/apollo/home/gethomebyid';
import { HomeData } from '@lib/interface';
import useResize from '@lib/use-resize';

interface FormProps {
    closeForm: () => void;
    homeId: string;
    callback?: () => void;
    defautDes?: {
        key: string;
        des: string;
    }[];
}

export const EditDescription = ({ closeForm, homeId, callback, defautDes }: FormProps) => {
    const toast = useToast();
    const [mobilemode] = useResize();
    const [updateHome] = useMutation(updateHomeDescription.command, {
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
    const [key, setKey] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const [className] = useClassName(styles);
    const [listProperty, setListProperty] = useState<
        {
            key: string;
            des: string;
        }[]
    >(defautDes ?? []);

    const newDes = useCallback(
        (key, description) => {
            return {
                key,
                des: description,
            };
        },
        [listProperty]
    );

    const renderPropertys = useMemo(() => {
        return listProperty.map((item, index) => {
            return (
                <div key={index} {...className('homeform-description__property')}>
                    <h1>{item.key}</h1>
                    <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const text = e.target.innerText;
                            let list = listProperty.slice();
                            console.log(text, text.length);
                            if (text.length != 0) {
                                list[index].des = text;
                            } else {
                                list.splice(index, 1);
                            }
                            console.log(list);
                            setListProperty(list);
                        }}
                        onKeyPress={(e) => {
                            if (e.which == 13) {
                                e.preventDefault();
                                //@ts-ignore
                                const text = e.target.innerText;
                                let list = listProperty.slice();
                                if (text) {
                                    list[index].des = text;
                                } else {
                                    list = list.filter((item) => item.key != index.toString());
                                }
                                setListProperty(list);
                                //@ts-ignore
                                e.target.blur();
                            }
                        }}
                    >
                        {item.des}
                    </p>
                </div>
            );
        });
    }, [listProperty]);

    /* useEffect(() => {
        scroll.disableScroll();

        return () => {
            scroll.enableScroll();
        };
    }, []); */

    const [upLoading, setUpLoading] = useState(false);

    const submitForm = useCallback(() => {
        const des = JSON.stringify(listProperty);
        setUpLoading(true);
        updateHome({
            variables: updateHomeDescription.variables(des, homeId),
        }).catch(() => {
            toast({
                title: `Server timeout`,
                position: 'bottom-left',
                status: 'error',
                description: 'Có vấn đề với kết nối',
                isClosable: true,
            });
            setUpLoading(false);
        });
    }, [listProperty]);

    return (
        <Modal
            onClose={closeForm}
            isOpen={true}
            scrollBehavior="outside"
            {...(mobilemode ? { size: 'full' } : {})}
        >
            <ModalOverlay overflowY="scroll" />
            <ModalContent maxWidth="500px" {...(mobilemode ? { borderRadius: 0 } : {})}>
                <ModalHeader>Mô tả</ModalHeader>
                <ModalCloseButton tabIndex={-1} />
                <ModalBody>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            let k = key;
                            if (k == 'Mô tả chung') {
                                k = '';
                            }
                            const newData = newDes(k, description);
                            const index = listProperty.findIndex((item) => item.key == k);
                            if (index != -1) {
                                let list = listProperty.slice();
                                if (description && description != '') {
                                    list[index].des = description;
                                } else {
                                    list = list.filter((item) => item.key != index.toString());
                                }
                                setListProperty([...list]);
                            } else {
                                setListProperty([...listProperty, newData]);
                            }
                            setKey('');
                            setDescription('');
                        }}
                    >
                        <Text {...className('homeform-form__lb')}>Mô tả chung</Text>
                        <div {...className('homeform-description')}>{renderPropertys}</div>
                        <Input
                            borderWidth="3px"
                            _focus={{
                                outline: 'none',
                                borderColor: '#80befc',
                            }}
                            marginTop="10px"
                            placeholder="key"
                            value={key}
                            onChange={(e) => {
                                const k = e.target.value;
                                setKey(e.target.value);
                                const index = listProperty.find((item) => item.key == k);
                                if (index) {
                                    setDescription(index.des);
                                }
                            }}
                        />
                        <Textarea
                            size="md"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            borderWidth="3px"
                            margin="10px 0"
                            _focus={{
                                outline: 'none',
                                borderColor: '#80befc',
                            }}
                        ></Textarea>
                        <Button width="100%" type="submit">
                            Add
                        </Button>
                    </form>
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
                            onClick={() => {
                                submitForm();
                            }}
                            isLoading={upLoading}
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
