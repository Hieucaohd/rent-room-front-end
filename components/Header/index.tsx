import { useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Avatar,
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useDisclosure,
} from '@chakra-ui/react';
import { useCycle } from 'framer-motion';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo, useRef, useState } from 'react';
import headerStyle from '../../chakra';
import { LOGOUT } from '../../lib/apollo/auth';
import useResize from '../../lib/use-resize';
import { User } from '../../lib/withAuth';

export interface IHeaderProps {
    user: User | null;
}

const getPath = (path: string): number => {
    const index = path.split('/');
    if (index.length <= 0) {
        return 0;
    }
    switch (index[0]) {
        case '':
            return 0;
        case '/home':
            return 1;
        case '/store':
            return 2;
        case '/contact':
            return 3;
        case '/about':
            return 4;
        default:
            return 0;
    }
};

const Path = (props: any) => (
    <motion.path
        fill="transparent"
        strokeWidth="3"
        stroke="hsl(0, 0%, 18%)"
        strokeLinecap="round"
        {...props}
    />
);

export default function Header({ user }: IHeaderProps) {
    const router = useRouter();
    const [menuShowing, openMenu] = useCycle(false, true);
    const [logOut] = useMutation(LOGOUT);
    const [mobilemode] = useResize();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleLogOut = () => {
        console.log('logout');
        try {
            setLoading(true);
            logOut().then(() => {
                router.reload();
            });
        } catch (e) {
            console.log(e);
        }
    };

    const sidebar = useMemo(() => {
        const positionX = mobilemode ? 30 : 40;
        return {
            open: (height = 1000) => ({
                clipPath: `circle(${height * 2 + 200}px at ${positionX}px -10px)`,
                transition: {
                    type: 'spring',
                    stiffness: 20,
                    restDelta: 2,
                },
            }),
            closed: {
                clipPath: `circle(10px at ${positionX}px -10px)`,
                transition: {
                    delay: 0.5,
                    type: 'spring',
                    stiffness: 400,
                    damping: 40,
                },
            },
        };
    }, [mobilemode]);

    const menuTransition = {
        open: {
            transition: { staggerChildren: 0.07, delayChildren: 0.2 },
        },
        closed: {
            transition: { staggerChildren: 0.05, staggerDirection: -1 },
        },
    };

    const itemTransition = {
        open: {
            opacity: 1,
            transition: {
                y: { stiffness: 1000, velocity: -100 },
            },
        },
        closed: {
            opacity: 0,
            transition: {
                y: { stiffness: 1000 },
            },
        },
    };

    return (
        <>
            <motion.nav
                exit={{ y: '-100%' }}
                transition={{
                    duration: 0.5,
                }}
                style={{ boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)' }}
                className="navbar"
            >
                <div className="navbar-left">
                    <motion.div className="navbar-menu" animate={menuShowing ? 'open' : 'closed'}>
                        <Button {...headerStyle.menuBtnStyle} onClick={() => openMenu()}>
                            <svg width="23" height="21" viewBox="0 -1 23 23">
                                <Path
                                    variants={{
                                        closed: { d: 'M 2 2.5 L 20 2.5' },
                                        open: { d: 'M 3 16.5 L 17 2.5' },
                                    }}
                                />
                                <Path
                                    d="M 2 9.423 L 20 9.423"
                                    variants={{
                                        closed: { opacity: 1 },
                                        open: { opacity: 0 },
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                                <Path
                                    variants={{
                                        closed: { d: 'M 2 16.346 L 20 16.346' },
                                        open: { d: 'M 3 2.5 L 17 16.346' },
                                    }}
                                />
                            </svg>
                        </Button>
                    </motion.div>
                    <div>
                        <Link href="/">
                            <a className="app-logo">
                                <span>Rent </span> <span>Room</span>
                            </a>
                        </Link>
                    </div>
                </div>
                <div className="navbar-center">
                    <Button {...headerStyle.linkBtnStyle} fontWeight="700" variant="link">
                        Trang Chủ
                    </Button>
                    <Button {...headerStyle.linkBtnStyle} variant="link">
                        Store
                    </Button>
                    <Button {...headerStyle.linkBtnStyle} variant="link">
                        Contact
                    </Button>
                    <Button {...headerStyle.linkBtnStyle} variant="link">
                        About
                    </Button>
                </div>
                {!user && (
                    <div className="navbar-right">
                        <Button
                            onClick={() => router.push('/signin')}
                            {...headerStyle.signInBtnStyle}
                            variant="link"
                        >
                            Đăng Nhập
                        </Button>
                        <Button
                            onClick={() => router.push('/signup')}
                            {...headerStyle.signUpBtnStyle}
                        >
                            Đăng Ký
                        </Button>
                    </div>
                )}

                {user && (
                    <div className="navbar-right navbar-right--user">
                        {!mobilemode && <div>{user.fullname}</div>}
                        <Menu>
                            <MenuButton>
                                <Avatar
                                    name={user.fullname}
                                    src={user.avatar}
                                    borderWidth="2px"
                                    borderColor="gray"
                                    size="sm"
                                />
                            </MenuButton>
                            <MenuList>
                                {mobilemode && <div className="username">{user.fullname}</div>}
                                <MenuItem
                                    onClick={() => {
                                        router.push(`/user/${user._id}/homes`);
                                    }}
                                    icon={
                                        <i
                                            style={{ paddingLeft: '10px' }}
                                            className="fi fi-br-user"
                                        ></i>
                                    }
                                >
                                    Hồ sơ
                                </MenuItem>
                                <MenuItem
                                    icon={
                                        <i
                                            style={{ paddingLeft: '10px' }}
                                            className="fi fi-br-interrogation"
                                        ></i>
                                    }
                                >
                                    Giúp đỡ
                                </MenuItem>
                                <MenuItem
                                    icon={
                                        <i
                                            style={{ paddingLeft: '10px' }}
                                            className="fi fi-br-sign-out-alt"
                                        />
                                    }
                                    onClick={onOpen}
                                >
                                    Đăng xuất
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </div>
                )}
                <motion.div className="navbar-dropdown" animate={menuShowing ? 'open' : 'closed'}>
                    <div className="navbar-dropdown__bg"></div>
                    <motion.div
                        animate={{
                            boxShadow: '0 0px 10px rgba(0, 0, 0, 0.2)',
                        }}
                        variants={sidebar}
                        className="navbar-dropdown__menu"
                    >
                        <motion.div variants={menuTransition}>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                variants={itemTransition}
                            >
                                <Button {...headerStyle.linkBtnStyle} variant="link">
                                    <i className="fi fi-br-home"></i>Trang Chủ
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                variants={itemTransition}
                            >
                                <Button {...headerStyle.linkBtnStyle} variant="link">
                                    <i className="fi fi-br-shopping-cart"></i>
                                    Store
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                variants={itemTransition}
                            >
                                <Button {...headerStyle.linkBtnStyle} variant="link">
                                    <i className="fi fi-br-form"></i>
                                    Contact
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                variants={itemTransition}
                            >
                                <Button {...headerStyle.linkBtnStyle} variant="link">
                                    <i className="fi fi-br-info"></i>
                                    About
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.nav>
            <AlertDialog
                isOpen={isOpen}
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                size={mobilemode ? 'sm' : 'lg'}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Đăng xuất
                        </AlertDialogHeader>

                        <AlertDialogBody>Bạn có chắc chắn muốn đăng xuất?</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Hủy
                            </Button>
                            <Button
                                colorScheme="red"
                                isLoading={loading}
                                onClick={handleLogOut}
                                ml={3}
                            >
                                Đồng ý
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}
