import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Select,
    Tooltip,
} from '@chakra-ui/react';
import { ConnectWithBtnStyle, InputStyle, linkBtnStyle } from '../chakra';
import { useMutation } from '@apollo/client';
import { SIGNUP } from '../lib/apollo/auth';
import useStore from '../store/useStore';
import { useRouter } from 'next/router';

export interface ISignUpProps {}

interface FormSignUp {
    email: string;
    password: string;
    passwordConfirm: string;
    fullname: string;
    callNumber: string;
    province: string;
    district: string;
    ward: string;
}

interface FormError {
    email?: boolean;
    password?: boolean;
    passwordConfirm?: boolean;
    fullname?: boolean;
    callNumber?: boolean;
    province?: boolean;
    district?: boolean;
    ward?: boolean;
}

const formError: FormError = {
    email: false,
    password: false,
    passwordConfirm: false,
    fullname: false,
    callNumber: false,
    province: false,
    district: false,
    ward: false,
};

const errorReducer = (state: FormError, data: FormError) => {
    if (data) {
        return { ...state, ...data };
    }
    return state;
};

const convertDataForm = (value: string, type: 'number' | 'string' = 'string') => {
    if (value === '') {
        return null;
    } else if (type === 'string') {
        return value;
    }
    const data = parseInt(value);
    if (isNaN(data)) {
        return null;
    }
    return data;
};

const checkCallNumber = (mobile: string) => {
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (mobile !== '') {
        if (vnf_regex.test(mobile) == false) {
            // alert('Số điện thoại của bạn không đúng định dạng!');
            return false;
        } else {
            // alert('Số điện thoại của bạn hợp lệ!');
            return true;
        }
    } else {
        // alert('Bạn chưa điền số điện thoại!');
        return false;
    }
};

const container = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.4,
            staggerChildren: 0.1,
        },
    },
    out: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const containerChild = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        x: -100,
    },
};

export default function SignUp(props: ISignUpProps) {
    const [signUpHandle] = useMutation(SIGNUP);
    const { user } = useStore();
    const router = useRouter();
    //#region form
    const { register, handleSubmit } = useForm<FormSignUp>();
    const emailField = register('email');
    const passwordField = register('password');
    const passwordConfirmField = register('passwordConfirm');
    const fullnameField = register('fullname');
    const numberPhoneField = register('callNumber');
    const provinceField = register('province');
    const districtField = register('district');
    const wardField = register('ward');
    //#endregion province

    //#region error state
    const [loading, setLoading] = useState(false);
    const [errorState, dispatch] = useReducer(errorReducer, formError);
    //#endregion

    //#region location api
    //province
    const [provinceList, setProvinceList] = useState<any[]>([]);
    const [provinceActive, setProvinceActive] = useState<any>(null);
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then((res) => res.json())
            .then((data) => {
                if (data?.length) {
                    setProvinceList(data);
                }
            });
    }, []);
    const renderProvinceList = useMemo(
        () =>
            provinceList.map((item, index) => {
                return (
                    <option key={index} value={item.code}>
                        {item.name}
                    </option>
                );
            }),
        [provinceList]
    );

    //district
    const [districtList, setdistrictList] = useState<any[]>([]);
    const [districtActive, setDistrictActive] = useState<any>(null);
    useEffect(() => {
        if (provinceActive) {
            fetch(`https://provinces.open-api.vn/api/p/${provinceActive}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.districts) {
                        setdistrictList(data.districts);
                    }
                });
        }
    }, [provinceActive]);
    const renderDistrictList = useMemo(
        () =>
            districtList.map((item, index) => {
                return (
                    <option key={index} value={item.code}>
                        {item.name}
                    </option>
                );
            }),
        [districtList]
    );

    //district
    const [wardList, setWardList] = useState<any[]>([]);
    useEffect(() => {
        if (districtActive) {
            fetch(`https://provinces.open-api.vn/api/d/${districtActive}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.wards) {
                        setWardList(data.wards);
                    }
                });
        }
    }, [districtActive]);
    const renderWardList = useMemo(
        () =>
            wardList.map((item, index) => {
                return (
                    <option key={index} value={item.code}>
                        {item.name}
                    </option>
                );
            }),
        [wardList]
    );
    //#endregion
    const [showPassword, setShowPassword] = useState(false);
    const submitForm = useCallback(async (e: FormSignUp) => {
        let error = false;
        const errorSet: any = {};
        if (e.password !== e.passwordConfirm) {
            console.log('error confirm password');
            errorSet.passwordConfirm = true;
            error = true;
        }
        if (!checkCallNumber(e.callNumber)) {
            errorSet.callNumber = true;
            error = true;
        }
        if (e.fullname === '') {
            errorSet.fullname = true;
            error = true;
        }
        if (e.province === '') {
            errorSet.province = true;
            error = true;
        }
        if (e.district === '') {
            errorSet.district = true;
            error = true;
        }
        if (e.ward === '') {
            errorSet.ward = true;
            error = true;
        }

        if (error) {
            dispatch(errorSet);
            return;
        }
        const newUser = {
            email: convertDataForm(e.email),
            password: convertDataForm(e.password),
            fullname: convertDataForm(e.fullname),
            numberPhone: convertDataForm(e.callNumber),
            province: convertDataForm(e.province, 'number'),
            district: convertDataForm(e.district, 'number'),
            ward: convertDataForm(e.ward, 'number'),
        };
        setLoading(true);
        signUpHandle({
            variables: {
                newUser: newUser,
            },
        })
            .then(() => {
                console.log(newUser);
                location.href = '/';
            })
            .catch(({ message }: { message: string }) => {
                setLoading(false);
                console.log(message);
                if (message.includes('duplicate key error collection')) {
                    dispatch({
                        email: true,
                    });
                }
            });
    }, []);

    useEffect(() => {
        if (user.info) {
            location.href = '/';
        }
    }, [user]);

    return (
        <motion.div className="signup">
            <motion.div
                initial={{
                    opacity: 0,
                    x: 100,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                }}
                exit={{
                    opacity: 0,
                    x: 100,
                }}
                transition={{
                    duration: 0.5,
                    delayChildren: 0.2,
                    staggerChildren: 0.2,
                }}
                className="signup-bg"
            >
                <img src="/signupbg.svg" alt="" />
            </motion.div>
            <motion.div className="signup-base">
                <motion.div variants={container} initial="hidden" animate="visible" exit="out">
                    <motion.div variants={containerChild} className="signup-base__label">
                        <div>Đăng Ký</div>
                        <div>Vui lòng điền thông tin của bạn vào bên dưới</div>
                    </motion.div>
                    <motion.form className="signup-form" onSubmit={handleSubmit(submitForm)}>
                        <motion.div variants={containerChild}>
                            <Tooltip
                                label="tài khoản này đã tồn tại"
                                borderRadius="3px"
                                isDisabled={!errorState.email}
                                placement="bottom"
                                bg="red"
                                hasArrow
                            >
                                <InputGroup className="signup-form__child">
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<i className="fi fi-br-envelope"></i>}
                                    />
                                    <Input
                                        {...InputStyle}
                                        {...emailField}
                                        {...(errorState.email ? { borderColor: 'red' } : {})}
                                        onChange={(e) => {
                                            if (errorState.email) {
                                                dispatch({
                                                    email: false,
                                                });
                                            }
                                            emailField.onChange(e);
                                        }}
                                        type="email"
                                        placeholder="email"
                                    />
                                </InputGroup>
                            </Tooltip>
                        </motion.div>
                        <motion.div variants={containerChild}>
                            <InputGroup className="signup-form__child">
                                <InputLeftElement
                                    pointerEvents="none"
                                    children={<i className="fi fi-br-key"></i>}
                                />
                                <Input
                                    {...InputStyle}
                                    {...passwordField}
                                    onChange={(e) => {
                                        passwordField.onChange(e);
                                    }}
                                    placeholder="mật khẩu"
                                    type={showPassword ? 'text' : 'password'}
                                />
                                <InputRightElement
                                    onClick={() => setShowPassword(!showPassword)}
                                    cursor="pointer"
                                    children={
                                        <Button
                                            backgroundColor="transparent"
                                            _focus={{ outline: 'none' }}
                                            _active={{ backgroundColor: 'transparent' }}
                                            _hover={{ backgroundColor: 'transparent' }}
                                        >
                                            {showPassword ? (
                                                <i className="fi fi-bs-eye"></i>
                                            ) : (
                                                <i className="fi fi-bs-eye-crossed"></i>
                                            )}
                                        </Button>
                                    }
                                />
                            </InputGroup>
                        </motion.div>
                        <motion.div variants={containerChild}>
                            <Tooltip
                                label="mật khẩu xác nhận sai"
                                borderRadius="3px"
                                isDisabled={!errorState.passwordConfirm}
                                placement="bottom"
                                bg="red"
                                hasArrow
                            >
                                <InputGroup className="signup-form__child">
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<i className="fi fi-br-key"></i>}
                                    />
                                    <Input
                                        {...InputStyle}
                                        {...passwordConfirmField}
                                        {...(errorState.passwordConfirm
                                            ? { borderColor: 'red' }
                                            : {})}
                                        onChange={(e) => {
                                            if (errorState.passwordConfirm) {
                                                dispatch({
                                                    passwordConfirm: false,
                                                });
                                            }
                                            passwordConfirmField.onChange(e);
                                        }}
                                        placeholder="xác nhận mật khẩu"
                                        type={showPassword ? 'text' : 'password'}
                                    />
                                    <InputRightElement
                                        onClick={() => setShowPassword(!showPassword)}
                                        cursor="pointer"
                                        children={
                                            <Button
                                                backgroundColor="transparent"
                                                _focus={{ outline: 'none' }}
                                                _active={{ backgroundColor: 'transparent' }}
                                                _hover={{ backgroundColor: 'transparent' }}
                                            >
                                                {showPassword ? (
                                                    <i className="fi fi-bs-eye"></i>
                                                ) : (
                                                    <i className="fi fi-bs-eye-crossed"></i>
                                                )}
                                            </Button>
                                        }
                                    />
                                </InputGroup>
                            </Tooltip>
                        </motion.div>
                        <motion.div variants={containerChild}>
                            <Tooltip
                                label="Họ và Tên không hợp lệ"
                                borderRadius="3px"
                                isDisabled={!errorState.fullname}
                                placement="bottom"
                                bg="red"
                                hasArrow
                            >
                                <InputGroup className="signup-form__child">
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<i className="fi fi-bs-user"></i>}
                                    />
                                    <Input
                                        {...InputStyle}
                                        {...fullnameField}
                                        {...(errorState.fullname ? { borderColor: 'red' } : {})}
                                        onChange={(e) => {
                                            if (errorState.fullname) {
                                                dispatch({ fullname: false });
                                            }
                                            fullnameField.onChange(e);
                                        }}
                                        placeholder="Họ và Tên"
                                    />
                                </InputGroup>
                            </Tooltip>
                        </motion.div>
                        <motion.div variants={containerChild}>
                            <Tooltip
                                label="Số điện thoại không hợp lệ"
                                borderRadius="3px"
                                isDisabled={!errorState.callNumber}
                                placement="bottom"
                                bg="red"
                                hasArrow
                            >
                                <InputGroup className="signup-form__child">
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<i className="fi fi-br-call-history"></i>}
                                    />
                                    <Input
                                        {...InputStyle}
                                        {...numberPhoneField}
                                        {...(errorState.callNumber ? { borderColor: 'red' } : {})}
                                        onChange={(e) => {
                                            if (errorState.callNumber) {
                                                dispatch({
                                                    callNumber: false,
                                                });
                                            }
                                            numberPhoneField.onChange(e);
                                        }}
                                        type="number"
                                        placeholder="SĐT"
                                    />
                                </InputGroup>
                            </Tooltip>
                        </motion.div>
                        <motion.div variants={containerChild} className="signup-form__locate">
                            <div>Vị trí của bạn</div>
                            <div>
                                <Tooltip
                                    label="Tỉnh/TP không hợp lệ"
                                    borderRadius="3px"
                                    isDisabled={!errorState.province}
                                    placement="bottom"
                                    bg="red"
                                    hasArrow
                                >
                                    <Select
                                        height="50px"
                                        borderWidth="3px"
                                        cursor="pointer"
                                        _focus={{
                                            outline: 'none',
                                            borderColor: '#80befc',
                                        }}
                                        placeholder="Tỉnh/TP"
                                        {...provinceField}
                                        {...(errorState.province ? { borderColor: 'red' } : {})}
                                        onChange={(e) => {
                                            if (errorState.province) {
                                                dispatch({
                                                    province: false,
                                                });
                                            }
                                            provinceField.onChange(e);
                                            setProvinceActive(e.target.value);
                                        }}
                                    >
                                        {renderProvinceList}
                                    </Select>
                                </Tooltip>
                                <Tooltip
                                    label="Quận/Huyện không hợp lệ"
                                    borderRadius="3px"
                                    isDisabled={!errorState.district}
                                    placement="bottom"
                                    bg="red"
                                    hasArrow
                                >
                                    <Select
                                        height="50px"
                                        borderWidth="3px"
                                        cursor="pointer"
                                        _focus={{
                                            outline: 'none',
                                            borderColor: '#80befc',
                                        }}
                                        placeholder="Quận/Huyện"
                                        {...districtField}
                                        {...(errorState.district ? { borderColor: 'red' } : {})}
                                        onChange={(e) => {
                                            if (errorState.district) {
                                                dispatch({
                                                    district: false,
                                                });
                                            }
                                            districtField.onChange(e);
                                            setDistrictActive(e.target.value);
                                        }}
                                    >
                                        {renderDistrictList}
                                    </Select>
                                </Tooltip>
                                <Tooltip
                                    label="Xã/Phường không hợp lệ"
                                    borderRadius="3px"
                                    isDisabled={!errorState.ward}
                                    placement="bottom"
                                    bg="red"
                                    hasArrow
                                >
                                    <Select
                                        height="50px"
                                        borderWidth="3px"
                                        cursor="pointer"
                                        _focus={{
                                            outline: 'none',
                                            borderColor: '#80befc',
                                        }}
                                        placeholder="Xã/Phường"
                                        {...wardField}
                                        {...(errorState.ward ? { borderColor: 'red' } : {})}
                                        onChange={(e) => {
                                            if (errorState.ward) {
                                                dispatch({
                                                    ward: false,
                                                });
                                            }
                                            wardField.onChange(e);
                                        }}
                                    >
                                        {renderWardList}
                                    </Select>
                                </Tooltip>
                            </div>
                        </motion.div>
                        <motion.div
                            className="signup-form__submit"
                            variants={containerChild}
                            {...(!loading
                                ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }
                                : {})}
                        >
                            <Button isLoading={loading} width={'100%'} type="submit">
                                Đăng Ký
                            </Button>
                        </motion.div>
                    </motion.form>
                    <motion.div variants={containerChild}>
                        <Button
                            marginTop="20px"
                            _focus={{ outline: 'none' }}
                            onClick={() => router.push('/signin')}
                            variant="link"
                        >
                            Bạn đã có tài khoản?
                        </Button>
                    </motion.div>
                    <motion.div variants={containerChild} className="lb-form__ocw">
                        <span>or continue with</span>
                    </motion.div>
                    <motion.div variants={containerChild} className="signin__connect-with">
                        <Button {...ConnectWithBtnStyle}>
                            <img src="/google.svg" alt="" />
                        </Button>
                        <Button {...ConnectWithBtnStyle}>
                            <img src="/apple.svg" alt="" />
                        </Button>
                        <Button {...ConnectWithBtnStyle}>
                            <img src="/facebook.svg" alt="" />
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
