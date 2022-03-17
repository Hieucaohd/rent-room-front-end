import { useMutation } from '@apollo/client';
import Link from 'next/link';
import React from 'react';
import { LOGOUT } from '../../lib/apollo/auth';
import { UserStore, useStore } from '../../store/store';

export interface IHeaderProps {
    isLoading: boolean;
}

export default function Header({ isLoading }: IHeaderProps) {
    const user = useStore((state: UserStore) => state.user);
    const removeUser = useStore((state: UserStore) => state.removeUser);
    const [logOut] = useMutation(LOGOUT);
    const handleLogOut = async () => {
        try {
            removeUser();
            await logOut();
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <div className="header">
            {!user && !isLoading && (
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
