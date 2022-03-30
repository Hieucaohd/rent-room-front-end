import { useLazyQuery } from '@apollo/client';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { LOGIN } from '../lib/apollo/auth';
import { User, withAuth } from '../lib/withAuth';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Button,
    ButtonProps,
    Input,
    InputGroup,
    InputLeftElement,
    InputProps,
    InputRightElement,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { ConnectWithBtnStyle, InputStyle } from '../chakra';
import useStore from '../store/useStore';

export interface ISignInProps {
    user: User;
}

export const getServerSideProps = (context: GetServerSidePropsContext) => {
    return {
        props: {}
    };
}

const SignInBtnAnimation = {};

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

export default function SignIn() {
    const [login, { data }] = useLazyQuery(LOGIN);
    const router = useRouter();
    const { info: user } = useStore(state => state.user)
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit } = useForm<LoginForm>();
    const emailField = register('email');
    const passwordField = register('password');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorLog>({ type: 'user', message: null });
    const emailError = !!(error.type === 'user' && error.message);
    const passwordError = !!(error.type === 'password' && error.message);

    //quay trở lại page đang truy cập nếu có
    const { p: currentPage } = router.query

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
        console.log(data, user)
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
                exit={{
                    opacity: 0,
                    translateX: '-100%',
                }}
                transition={{
                    duration: 0.5,
                }}
                className="signin-bg"
            >
                <motion.img
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.5,
                    }}
                    src="/loginbg.svg"
                    alt="login background"
                />
                <motion.div
                    initial={{
                        scale: 10,
                        rotateZ: '-360deg',
                        translateX: '-50%',
                        translateY: '-50%',
                    }}
                    animate={{
                        scale: 1,
                        rotateZ: '0deg',
                        translateX: '-50%',
                        translateY: '-50%',
                    }}
                    transition={{
                        duration: 1,
                    }}
                    className="app-logo"
                >
                    <span>Rent </span> <span>Room</span>
                </motion.div>
                <div className="signin-bg__connect">
                    <motion.i
                        initial={{
                            y: 100,
                        }}
                        animate={{
                            y: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 1,
                        }}
                        className="fi fi-brands-facebook"
                    ></motion.i>
                    <motion.i
                        initial={{
                            y: 100,
                        }}
                        animate={{
                            y: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 1.1,
                        }}
                        className="fi fi-brands-instagram"
                    ></motion.i>
                    <motion.i
                        initial={{
                            y: 100,
                        }}
                        animate={{
                            y: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 1.2,
                        }}
                        className="fi fi-brands-twitter"
                    ></motion.i>
                </div>
            </motion.div>
            <motion.div
                exit={{
                    opacity: 0,
                    translateX: '100%',
                }}
                transition={{
                    duration: 0.5,
                }}
                className="signin-base"
            >
                <motion.div>
                    <motion.h1
                        initial={{
                            x: '100vw',
                        }}
                        animate={{
                            x: '0',
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 1.4,
                        }}
                    >
                        Đăng Nhập
                    </motion.h1>
                    <motion.div
                        initial={{
                            x: '100vw',
                        }}
                        animate={{
                            x: '0',
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 1.5,
                        }}
                    >
                        Vui lòng điền thông tin của bạn vào bên dưới
                    </motion.div>
                    <motion.form
                        initial={{
                            x: '100vw',
                        }}
                        animate={{
                            x: '0',
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 1.6,
                        }}
                        className="signin-form"
                        onSubmit={handleSubmit(loginSubmit)}
                    >
                        <InputGroup>
                            <InputLeftElement
                                pointerEvents="none"
                                children={<i className="fi fi-br-envelope"></i>}
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
                                children={<i className="fi fi-br-key"></i>}
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
                    <motion.div
                        initial={{
                            x: '100vw',
                        }}
                        animate={{
                            x: '0',
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 1.8,
                        }}
                        className="signin__create-account"
                    >
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
                    <motion.div
                        initial={{
                            y: '50vh',
                        }}
                        animate={{
                            y: '0',
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 2,
                        }}
                        className="lb-form__ocw"
                    >
                        <span>or continue with</span>
                    </motion.div>
                    <motion.div
                        initial={{
                            y: '50vh',
                        }}
                        animate={{
                            y: '0',
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 2,
                        }}
                        className="signin__connect-with"
                    >
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
