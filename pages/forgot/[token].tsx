import { gql } from '@apollo/client';
import {
    Avatar,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import jwtDecode from 'jwt-decode';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import client from '@lib/apollo/apollo-client';
import { User } from '@lib/withAuth';
import { ErrorAction, ForgotForm } from '@lib/interface';
import { signUpBtnStyle } from '@chakra';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    let { token } = query;
    if (token) {
        token = token.toString();
        try {
            const decodeToken: { exp: number; _id: string } = jwtDecode(token);
            const exp = Date.now();
            if (decodeToken && exp < decodeToken.exp * 1000) {
                const _id = decodeToken._id;
                const { data } = await client.query({
                    query: gql`
                        query GetUserById($getUserByIdId: ID!) {
                            getUserById(id: $getUserByIdId) {
                                fullname
                                avatar
                            }
                        }
                    `,
                    variables: {
                        getUserByIdId: _id,
                    },
                    fetchPolicy: 'no-cache',
                });

                if (data && data.getUserById) {
                    return {
                        props: {
                            token: token,
                            user: data.getUserById,
                        },
                    };
                }
            }
        } catch (error) {
            return {
                redirect: {
                    permanent: false,
                    destination: '404',
                },
            };
        }
    }
    return {
        redirect: {
            permanent: true,
            destination: '404',
        },
    };
};

const container = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            delayChildren: 0.4,
            staggerChildren: 0.1,
        },
    },
    out: {
        opacity: 0,
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

interface ForgotProps {
    token: string;
    user: User;
}

export default function ForgotPassword({ token, user }: ForgotProps) {
    const { register, handleSubmit } = useForm<ForgotForm>();
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [errorAction, setErrorAction] = useState<ErrorAction>({
        password: false,
        passwordConfirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const submitForm = useCallback((e: ForgotForm) => {
        let hasError = false;
        const errorHandle = {
            password: false,
            passwordConfirm: false,
        };
        console.log(e);
        if (e.password == '') {
            hasError = true;
            errorHandle.password = true;
        }
        if (e.passwordConfirm !== e.password) {
            hasError = true;
            errorHandle.passwordConfirm = true;
        }
        if (hasError) {
            setErrorAction(errorHandle);
        } else {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/forgot/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
                body: JSON.stringify({ password: e.password }),
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return res.text().then((text) => {
                            throw new Error(text);
                        });
                    }
                })
                .then(() => {
                    toast({
                        title: 'Thông báo',
                        description: 'Cập nhật mật khẩu thành công',
                        status: 'success',
                        isClosable: true,
                        position: 'bottom-left',
                    });
                    setSuccess(true);
                })
                .catch(({ message }: Error) => {
                    console.log(message);
                    setLoading(false);
                    if (message.includes('jwt expired')) {
                        toast({
                            title: 'Phiên làm việc hết hạn',
                            description: 'Vui lòng gửi yêu cầu mới',
                            status: 'error',
                            isClosable: true,
                            position: 'bottom-left',
                        });
                    } else {
                        toast({
                            title: 'Server time out',
                            status: 'error',
                            isClosable: true,
                            position: 'bottom-left',
                        });
                    }
                });
        }
    }, []);
    return (
        <>
            <Head>
                <title>Đổi mật khẩu</title>
            </Head>
            <motion.div className="forgotpw-base">
                {!success ? (
                    <motion.div
                        className="forgotpw"
                        key={1}
                        variants={container}
                        initial="hidden"
                        animate="visible"
                        exit="out"
                    >
                        <motion.div variants={containerChild}>
                            <Avatar
                                name={user.fullname}
                                size="2xl"
                                position="relative"
                                children={
                                    <svg
                                        className="avatar__border"
                                        width={'calc(100%)'}
                                        height={'calc(100%)'}
                                    >
                                        <circle
                                            strokeLinecap="round"
                                            stroke-mitterlimit="0"
                                            cx="50%"
                                            cy="50%"
                                            r="calc((100% - 3px)/2)"
                                            strokeWidth="3px"
                                            stroke="gray"
                                            fill="transparent"
                                        />
                                    </svg>
                                }
                                src={user.avatar}
                            />
                        </motion.div>
                        <motion.div variants={containerChild}>{user.fullname}</motion.div>
                        <form className="forgotpw-form" onSubmit={handleSubmit(submitForm)}>
                            <motion.div variants={containerChild}>
                                <InputGroup className="forgotpw-form__group">
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<i className="fa-solid fa-key"></i>}
                                    />
                                    <Input
                                        borderWidth="3px"
                                        borderColor={errorAction.password ? 'red.300' : 'gray.300'}
                                        height="50px"
                                        width="100%"
                                        bgColor="white"
                                        _focus={{
                                            borderColor: '#80BEFC',
                                        }}
                                        placeholder="mật khẩu mới"
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        onChange={(e) => {
                                            register('password').onChange(e);
                                            setErrorAction({
                                                password: false,
                                                passwordConfirm: false,
                                            });
                                        }}
                                    />
                                    <InputRightElement
                                        onClick={() => setShowPassword(!showPassword)}
                                        cursor="pointer"
                                        children={
                                            <Button
                                                tabIndex={-1}
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
                                    {errorAction.password && (
                                        <div className="forgotpw-form__group-error">
                                            Mật khẩu phải có tối thiểu 1 ký tự
                                        </div>
                                    )}
                                </InputGroup>
                            </motion.div>
                            <motion.div variants={containerChild}>
                                <InputGroup className="forgotpw-form__group">
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<i className="fa-solid fa-key"></i>}
                                    />
                                    <Input
                                        borderWidth="3px"
                                        borderColor={
                                            errorAction.passwordConfirm ? 'red.300' : 'gray.300'
                                        }
                                        height="50px"
                                        width="100%"
                                        bgColor="white"
                                        _focus={{
                                            borderColor: '#80BEFC',
                                        }}
                                        placeholder="nhập lại mật khẩu mới"
                                        {...register('passwordConfirm')}
                                        onChange={(e) => {
                                            register('passwordConfirm').onChange(e);
                                            setErrorAction({
                                                ...errorAction,
                                                passwordConfirm: false,
                                            });
                                        }}
                                        type={showPassword ? 'text' : 'password'}
                                    />
                                    <InputRightElement
                                        onClick={() => setShowPassword(!showPassword)}
                                        cursor="pointer"
                                        children={
                                            <Button
                                                tabIndex={-1}
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
                                    {errorAction.passwordConfirm && (
                                        <div className="forgotpw-form__group-error">
                                            Mật khẩu xác nhận sai
                                        </div>
                                    )}
                                </InputGroup>
                            </motion.div>
                            <motion.div variants={containerChild} className="forgotpw-form__submit">
                                <Button
                                    {...signUpBtnStyle}
                                    height={'unset'}
                                    backgroundColor="var(--app-btn-bgcolor)"
                                    fontWeight="bold"
                                    type="submit"
                                    isLoading={loading}
                                >
                                    Đổi mật khẩu
                                </Button>
                            </motion.div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        className="forgotpw"
                        key={2}
                        variants={container}
                        initial="hidden"
                        animate="visible"
                        exit="out"
                    >
                        <motion.div className="forgotpw__status forgotpw__status--success">
                            <div>
                                <motion.div
                                    initial={{
                                        width: '0%',
                                    }}
                                    animate={{
                                        width: '100%',
                                    }}
                                    transition={{
                                        duration: 0.5,
                                    }}
                                ></motion.div>
                            </div>
                            <div>
                                <motion.div
                                    initial={{
                                        width: '0%',
                                    }}
                                    animate={{
                                        width: '100%',
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 0.5,
                                    }}
                                ></motion.div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{
                                y: 50,
                                opacity: 0,
                            }}
                            animate={{
                                y: 0,
                                opacity: 1,
                            }}
                            transition={{
                                duration: 1,
                                delay: 1.1,
                            }}
                            className="forgotpw__message"
                        >
                            Bạn đã cập nhật mật khẩu thành công!
                        </motion.div>
                        <motion.div
                            initial={{
                                y: 50,
                                opacity: 0,
                            }}
                            animate={{
                                y: 0,
                                opacity: 1,
                            }}
                            transition={{
                                duration: 1,
                                delay: 2.1,
                            }}
                            className="forgotpw__link"
                        >
                            <Link href="/signin">
                                <a>Đi tới đăng nhập {' > '}</a>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </>
    );
}
