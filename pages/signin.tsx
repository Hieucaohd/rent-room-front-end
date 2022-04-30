import { useLazyQuery } from '@apollo/client';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { LOGIN } from '../lib/apollo/auth';
import { User, withAuth } from '../lib/withAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { ConnectWithBtnStyle, InputStyle } from '../chakra';
import useStore from '../store/useStore';

export interface ISignInProps {
    user: User;
}

interface LoginForm {
    email: string;
    password: string;
}

interface ErrorLog {
    type: 'user' | 'password';
    message: string | null;
}

const addError = (message: string): ErrorLog => {
    if (message.indexOf('This email is not registed') != -1) {
        return {
            type: 'user',
            message: message,
        };
    }

    if (message.indexOf('Password is incorrect') != -1) {
        return {
            type: 'password',
            message: message,
        };
    }

    return {
        type: 'user',
        message: null,
    };
};

const removeError = (): ErrorLog => {
    return {
        type: 'user',
        message: null,
    };
};

//framer motion
const bgContainer = {
    hidden: {
        opacity: 0,
        x: -100,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            delayChildren: 0.4,
            staggerChildren: 0.1,
        },
    },
    out: {
        opacity: 0,
        x: -100,
        transition: {
            duration: 0.4,
            staggerChildren: 0.05,
        },
    },
};

const bgContainerLogo = {
    hidden: { opacity: 0, x: '-50%' },
    visible: {
        opacity: 1,
        x: '-50%',
    },
    out: {
        opacity: 0,
        x: '-100%',
    },
};

const bgContainerChild = {
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
            staggerChildren: 0.1,
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
        x: 100,
    },
};

//

export default function SignIn() {
    const [login, { data }] = useLazyQuery(LOGIN);
    const router = useRouter();
    const { info: user } = useStore((state) => state.user);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit } = useForm<LoginForm>();
    const emailField = register('email');
    const passwordField = register('password');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorLog>({ type: 'user', message: null });
    const emailError = !!(error.type === 'user' && error.message);
    const passwordError = !!(error.type === 'password' && error.message);

    //quay trở lại page đang truy cập nếu có
    const { p: currentPage } = router.query;

    const loginSubmit = (e: LoginForm) => {
        console.log(e);
        setLoading(true);
        login({
            variables: {
                email: e.email,
                password: e.password,
            },
        }).catch((error) => {
            console.log(error);
            setLoading(false);
            setError(addError(error.message));
        });
    };

    useEffect(() => {
        console.log(data, user);
        if (data || user) {
            if (currentPage) {
                window.location.href = currentPage.toString();
            } else {
                window.location.href = '/';
            }
        }
    }, [data, user]);

    if (user) {
        return <></>;
    }

    return (
        <motion.div className="signin">
            <motion.div
                variants={bgContainer}
                initial="hidden"
                animate="visible"
                exit="out"
                className="signin-bg"
            >
                <motion.img src="/loginbg.svg" alt="login background" />
                <motion.div variants={bgContainerLogo} className="app-logo">
                    <span>Rent </span> <span>Room</span>
                </motion.div>
                <div className="signin-bg__connect">
                    <motion.i
                        variants={bgContainerChild}
                        className="fa-brands fa-facebook"
                    ></motion.i>
                    <motion.i
                        variants={bgContainerChild}
                        className="fa-brands fa-instagram"
                    ></motion.i>
                    <motion.i
                        variants={bgContainerChild}
                        className="fa-brands fa-twitter"
                    ></motion.i>
                </div>
            </motion.div>
            <motion.div
                variants={container}
                initial="hidden"
                animate="visible"
                exit="out"
                className="signin-base"
            >
                <motion.div>
                    <motion.h1 variants={containerChild}>Đăng Nhập</motion.h1>
                    <motion.div variants={containerChild}>
                        Vui lòng điền thông tin của bạn vào bên dưới
                    </motion.div>
                    <motion.form
                        variants={containerChild}
                        className="signin-form"
                        onSubmit={handleSubmit(loginSubmit)}
                    >
                        <InputGroup>
                            <InputLeftElement
                                pointerEvents="none"
                                children={<i className="fa-solid fa-envelope"></i>}
                            />
                            <Input
                                {...InputStyle}
                                {...(emailError ? { borderColor: 'red' } : {})}
                                {...emailField}
                                onChange={(e) => {
                                    if (error.message) {
                                        setError(removeError());
                                    }
                                    emailField.onChange(e);
                                }}
                                placeholder="email"
                            />
                        </InputGroup>
                        <div className="signin-errorlog">
                            {emailError && <span>{error.message}</span>}
                        </div>
                        <InputGroup>
                            <InputLeftElement
                                pointerEvents="none"
                                children={<i className="fa-solid fa-key"></i>}
                            />
                            <Input
                                {...InputStyle}
                                {...(passwordError ? { borderColor: 'red' } : {})}
                                {...passwordField}
                                onChange={(e) => {
                                    if (passwordError) {
                                        setError(removeError());
                                    }
                                    passwordField.onChange(e);
                                }}
                                placeholder="password"
                                type={showPassword ? 'text' : 'password'}
                            />
                            <InputRightElement
                                onClick={() => setShowPassword(!showPassword)}
                                cursor="pointer"
                                children={
                                    <Button
                                        backgroundColor="transparent"
                                        width="100%"
                                        _focus={{ outline: 'none' }}
                                        _active={{ backgroundColor: 'transparent' }}
                                        _hover={{ backgroundColor: 'transparent' }}
                                    >
                                        {showPassword ? (
                                            <i className="fa-solid fa-eye"></i>
                                        ) : (
                                            <i className="fa-solid fa-eye-slash"></i>
                                        )}
                                    </Button>
                                }
                            />
                        </InputGroup>
                        <div className="signin-errorlog">
                            {passwordError && <span>{error.message}</span>}
                        </div>
                        <Button
                            type="button"
                            display="flex"
                            justifyContent="flex-start"
                            _focus={{
                                outline: 'none',
                            }}
                            className="signin-form__forgot"
                            variant="link"
                        >
                            Bạn quên mật khẩu?
                        </Button>
                        <motion.div
                            {...(!loading
                                ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }
                                : {})}
                        >
                            <Button isLoading={loading} type="submit">
                                Đăng Nhập
                            </Button>
                        </motion.div>
                    </motion.form>
                    <motion.div variants={containerChild} className="signin__create-account">
                        <div>Bạn không có tài khoản?</div>
                        <Button
                            type="button"
                            display="flex"
                            justifyContent="flex-start"
                            fontSize="var(--app-login-labelsize)"
                            _focus={{
                                outline: 'none',
                            }}
                            variant="link"
                            onClick={() => router.push('/signup')}
                        >
                            Đăng ký
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
