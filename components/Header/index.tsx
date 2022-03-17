import { useMutation } from '@apollo/client';
import { AnyPointerEvent } from 'framer-motion/types/gestures/PanSession';
import Link from 'next/link';
import React from 'react';
import { LOGOUT } from '../../lib/apollo/auth';

export interface IHeaderProps {
    user: any;
}

export default function Header({ user }: IHeaderProps) {
    // const user = useStore((state: UserStore) => state.user);
    const [logOut] = useMutation(LOGOUT);
    const handleLogOut = async () => {
        try {
            await logOut();
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <div className="header">
            {!user && (
                <>
                    <Link href="/signin">
                        <a>Đăng nhập</a>
                    </Link>
                    <Link href="/signup">
                        <a>Đăng kí</a>
                    </Link>
                </>
            )}

            {user && (
                <h3>
                    {user.email} <button onClick={handleLogOut}>Đăng xuất</button>
                </h3>
            )}
        </div>
    );
}
