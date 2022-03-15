import React, { useEffect } from 'react';
import Link from 'next/link';
import userStore from '../../store/userStore';

export interface IHeaderProps {}

export default function Header(props: IHeaderProps) {
    const user = userStore(state => state.user);
    return (
        <div className="header">
            <Link href="/signin">
                <a>Đăng nhập</a>
            </Link>
            {user.email}
            <Link href="/signup">
                <a>Đăng kí</a>
            </Link>
        </div>
    );
}

