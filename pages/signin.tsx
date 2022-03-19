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

export interface ISignInProps {
    user: User;
}

export const getServerSideProps: GetServerSideProps = withAuth(
    (context: GetServerSidePropsContext) => {
        return {};
    }
);

const InputStyle: InputProps = {
    backgroundColor: '#e8f0fe',
    borderColor: '#e8f0fe',
    borderWidth: '3px',
    fontSize: 'var(--app-login-labelsize)',
    _focus: {
        backgroundColor: 'white',
        borderColor: '#80BEFC',
    },
};

const ConnectWithBtnStyle: ButtonProps = {
    padding: '10px',
    height: '50px',
    borderWidth: '1px',
    width: '100px',
};

const SignInBtnAnimation = {};

interface LoginForm {
    email: string;
    password: string;
}

export default function SignIn({ user }: ISignInProps) {
    const [login, { data, error }] = useLazyQuery(LOGIN);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit } = useForm<LoginForm>();
    const [loading, setLoading] = useState(false);

    const loginSubmit = (e: LoginForm) => {
        setLoading(true);
        login({
            variables: {
                email: e.email,
                password: e.password,
            },
        }).catch((error) => {
            console.log(error);
            setLoading(false);
        });
    };

    useEffect(() => {
        if (data || user) {
            window.location.href = '/';
        }
    }, [data, user]);

    if (user) {
        return <></>;
    }

    return (
        <motion.div className="signin">
            <motion.div className="signin-bg">
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
            <div className="signin-base">
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
                        Sign In
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
                        Please fill your information below
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
                            <Input {...InputStyle} {...register('email')} placeholder="email" />
                        </InputGroup>
                        <InputGroup>
                            <InputLeftElement
                                pointerEvents="none"
                                children={<i className="fi fi-br-key"></i>}
                            />
                            <Input
                                {...InputStyle}
                                {...register('password')}
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
                            Forgot your password?
                        </Button>
                        <motion.div
                            {...(!loading
                                ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }
                                : {})}
                        >
                            <Button isLoading={loading} type="submit">
                                Sign In
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
                        <div>You haven't an account?</div>
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
                            Create an account
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
            </div>
        </motion.div>
    );
}
