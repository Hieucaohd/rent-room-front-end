import styles from '../styles/style.module.scss';
import { Button, Input, Text, Textarea } from '@chakra-ui/react';
import { motion, Variants } from 'framer-motion';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import useClassName from '../../../lib/useClassName';
import { getSSRRoomById, RoomData, updateRoomDescription } from '../../../lib/apollo/home/room';

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

interface FormProps {
    closeForm: () => void;
    roomId: string;
    callback?: () => void;
    defautDes?: {
        key: string;
        des: string;
    }[];
}

export const EditRoomDescription = ({ closeForm, roomId, callback, defautDes }: FormProps) => {
    const mount = useRef(false);
    const [updateRoom] = useMutation(updateRoomDescription.command, {
        update(cache, { data: { updateRoom } }) {
            const data = cache.readQuery<{ getSSRRoomById: RoomData }>({
                query: getSSRRoomById.command,
                variables: getSSRRoomById.variables(roomId),
            });
            const newData = data ? { ...data.getSSRRoomById, ...updateRoom } : { ...updateRoom };
            cache.writeQuery({
                query: getSSRRoomById.command,
                variables: getSSRRoomById.variables(roomId),
                data: {
                    getSSRRoomById: newData,
                },
            });
        },
        onCompleted: () => {
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
                    <p>{item.des}</p>
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
        updateRoom({
            variables: updateRoomDescription.variables(des, roomId),
        }).catch(() => {
            setUpLoading(false);
        });
    }, [listProperty]);

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
                {...className('homeform-form description')}
                variants={formAnimate}
                initial="hidden"
                animate="show"
                exit="hidden"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitForm();
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
                        placeholder="key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    />
                    <Textarea
                        size="md"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        borderWidth="3px"
                        _focus={{
                            outline: 'none',
                            borderColor: '#80befc',
                        }}
                    ></Textarea>
                    <Button
                        onClick={() => {
                            const newData = newDes(key, description);
                            const index = listProperty.findIndex((item) => item.key == key);
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
                        Add
                    </Button>
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
                            Cập nhật
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

