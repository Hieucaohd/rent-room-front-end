import React from 'react';
import Link from 'next/link';

export interface IHeaderProps {}

export default function Header(props: IHeaderProps) {
    return (
        <div>
            <Link href="/signin">
                <a>Đăng nhập</a>
            </Link>
            <Link href="/signup">
                <a>Đăng kí</a>
            </Link>
        </div>
    );
}
