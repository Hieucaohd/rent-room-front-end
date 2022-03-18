import { useMutation } from '@apollo/client';
import { Button, ButtonProps } from '@chakra-ui/react';
import { AnyPointerEvent } from 'framer-motion/types/gestures/PanSession';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { LOGOUT } from '../../lib/apollo/auth';

export interface IHeaderProps {
    user: any;
}

const signUpBtnStyle: ButtonProps = {
    height: '100%',
    borderRadius: '5px',
    backgroundColor: 'var(--app-btn-bgcolor)',
    color: 'var(--app-btn-color)',
    paddingLeft: '25px',
    paddingRight: '25px',
    fontWeight: 'normal',
    _hover: {
        backgroundColor: 'var(--app-btn-bgcolor--hover)',
    },
    _active: {
        backgroundColor: 'var(--app-btn-bgcolor--active)',
    },
    _focus: {
        boxShadow: 'none',
    },
};

const signInBtnStyle: ButtonProps = {
    height: '100%',
    color: 'var(--app-btn-bgcolor)',
    paddingLeft: '25px',
    paddingRight: '25px',
    fontWeight: 'normal',
    _active: {
        color: 'var(--app-btn-bgcolor)'
    },
    _focus: {
        boxShadow: 'none',
    },
};

const LinkBtnStyle: ButtonProps = {
    height: '100%',
    color: 'black',
    paddingLeft: '25px',
    paddingRight: '25px',
    fontWeight: 'normal',
    _focus: {
        boxShadow: 'none',
    },
}

export default function Header({ user }: IHeaderProps) {
    const router = useRouter();
    const [logOut] = useMutation(LOGOUT);
    const handleLogOut = async () => {
        try {
            await logOut();
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="navbar">
            <div className="navbar-left">Rent Room</div>
            <div className="navbar-center">
                <Button {...LinkBtnStyle} fontWeight='medium' variant='link'>Home</Button>
                <Button {...LinkBtnStyle} variant='link'>Store</Button>
                <Button {...LinkBtnStyle} variant='link'>Contact</Button>
                <Button {...LinkBtnStyle} variant='link'>About</Button>
            </div>
            {!user && (
                <div className="navbar-right">
                    <Button
                        onClick={() => router.push('/signin')}
                        {...signInBtnStyle}
                        variant='link'
                    >
                        Log In
                    </Button>
                    <Button onClick={() => router.push('/signup')} {...signUpBtnStyle}>
                        Sign Up
                    </Button>
                </div>
            )}

            {user && (
                <h3>
                    {user.email} <button onClick={handleLogOut}>Đăng xuất</button>
                </h3>
            )}
        </div>
    );
}
