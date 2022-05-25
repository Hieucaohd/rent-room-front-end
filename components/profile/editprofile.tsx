import { useMutation } from '@apollo/client';
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
    Tooltip,
} from '@chakra-ui/react';
import { Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateProfile, UpdateProfile, useSubmitProfile } from '@lib/apollo/profile';
import { User } from '@lib/withAuth';
import FormLocation from '@components/location';
import { getListExitPosition } from '@lib/getPosition';
import AvatarUpload from '@components/avatar/AvatarUpload';
import headerStyle from '@chakra';
import { useRouter } from 'next/router';
import useResize from '@lib/use-resize';

interface RoomAmenityProps {
    closeForm: () => void;
    callback?: () => void;
    user: User;
}

export const EditProfile = ({ closeForm, callback, user }: RoomAmenityProps) => {
    const router = useRouter();
    const [mobilemode] = useResize();
    const [updateUserProfile] = useMutation(updateProfile.command, {
        onCompleted: () => {
            callback && callback();
            closeForm();
        },
    });
    const [isOpen, setOpen] = useState(false);
    const { register, handleSubmit, watch, setValue, getValues } = useForm<UpdateProfile>();
    const provinceData = watch('province');
    const districtData = watch('district');
    const wardData = watch('ward');
    const [listLocation, setListLocation] = useState<[any[], any[], any[]]>([[], [], []]);

    const submitForm = useCallback(async (e: any) => {
        return updateUserProfile({
            variables: updateProfile.variables(e),
        });
    }, []);

    const {
        submitUpdateProfile,
        error: errorAction,
        setError,
        loading,
    } = useSubmitProfile(submitForm, user);

    useEffect(() => {
        if (errorAction.province) {
            setError({ ...errorAction, province: false });
        }
    }, [provinceData]);

    useEffect(() => {
        if (errorAction.district) {
            setError({ ...errorAction, district: false });
        }
    }, [districtData]);

    useEffect(() => {
        if (errorAction.ward) {
            setError({ ...errorAction, ward: false });
        }
    }, [wardData]);

    const isHaveLocation = useMemo(() => {
        if (user.province && user.district && user.ward) {
            return true;
        }
        return false;
    }, [user]);

    const updateAvatarLink = useCallback((link: string) => {
        setValue('avatar', link);
    }, []);

    useEffect(() => {
        if (isHaveLocation) {
            getListExitPosition(user.province, user.district).then((res) => {
                setListLocation(res);
                setOpen(true);
            });
        } else {
            setOpen(true);
        }
    }, [user]);

    return (
        <>
            <Modal
                onClose={closeForm}
                isOpen={isOpen}
                {...(mobilemode ? { size: 'full' } : {})}
                scrollBehavior="outside"
            >
                <ModalOverlay overflowY="scroll" />
                <ModalContent
                    minWidth="min(500px, 100%)"
                    {...(mobilemode ? { borderRadius: 0 } : {})}
                >
                    <ModalHeader>Profile</ModalHeader>
                    <ModalCloseButton
                        _focus={{
                            boxShadow: 'none',
                        }}
                    />
                    <ModalBody paddingBottom="20px">
                        <form
                            style={{
                                display: 'flex',
                                flexFlow: 'column',
                                gap: '10px',
                            }}
                            onSubmit={handleSubmit(submitUpdateProfile)}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '15px',
                                }}
                            >
                                <AvatarUpload
                                    name={user.fullname}
                                    src={user.avatar}
                                    updateData={updateAvatarLink}
                                />
                            </div>
                            <Input
                                height="50px"
                                borderWidth="3px"
                                defaultValue={user.fullname}
                                _focus={{
                                    outline: 'none',
                                    borderColor: '#80befc',
                                }}
                                borderColor={errorAction.fullname ? 'red' : 'inherit'}
                                {...register('fullname')}
                                onChange={(e) => {
                                    setError({ ...errorAction, fullname: false });
                                    register('fullname').onChange(e);
                                }}
                                placeholder="Tên"
                            />
                            <Tooltip
                                isDisabled={!errorAction.numberPhone}
                                label="Số điện thoại không hợp lệ"
                                bgColor="red"
                                hasArrow
                            >
                                <Input
                                    height="50px"
                                    borderWidth="3px"
                                    defaultValue={user.numberPhone}
                                    _focus={{
                                        outline: 'none',
                                        borderColor: '#80befc',
                                    }}
                                    borderColor={errorAction.numberPhone ? 'red' : 'inherit'}
                                    {...register('numberPhone')}
                                    onChange={(e) => {
                                        setError({ ...errorAction, numberPhone: false });
                                        register('numberPhone').onChange(e);
                                    }}
                                    placeholder="Tên"
                                    type="number"
                                />
                            </Tooltip>
                            <Text className="addhome-form__label">Địa chỉ trọ</Text>
                            <div className="addhome-form__location">
                                <FormLocation
                                    provinceField={register('province')}
                                    districtField={register('district')}
                                    wardField={register('ward')}
                                    errorEvent={errorAction}
                                    allProvince={true}
                                    {...(isHaveLocation
                                        ? {
                                              defaultValue: {
                                                  value: {
                                                      province: user.province,
                                                      district: user.district,
                                                      ward: user.ward,
                                                  },
                                                  list: listLocation,
                                              },
                                          }
                                        : {})}
                                />
                            </div>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <div className="addhome-form__submit">
                            <Button
                                type="button"
                                onClick={() => {
                                    closeForm();
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={() => router.push('/profile/changepassword')}
                                {...headerStyle.signUpBtnStyle}
                                height="unset"
                                fontWeight="700"
                            >
                                Đổi mật khẩu
                            </Button>
                            <Button
                                isLoading={loading}
                                onClick={() => {
                                    const data = getValues();
                                    submitUpdateProfile(data);
                                }}
                                type="submit"
                                colorScheme="red"
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
