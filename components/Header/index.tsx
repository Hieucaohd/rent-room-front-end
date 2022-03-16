import Link from 'next/link';
import React, { useEffect } from 'react';
import { UserStore, useStore } from '../../store/store';

export interface IHeaderProps {}

export default function Header(props: IHeaderProps) {
    const user = useStore((state:UserStore) => state.user);
    
    return (
        <div className="header">
            <Link href="/signin">
                <a>Đăng nhập</a>
            </Link>
            <Link href="/signup">
                <a>Đăng kí</a>
            </Link>
        </div>
    );
}

