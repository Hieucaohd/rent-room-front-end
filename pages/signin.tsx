import { useLazyQuery } from '@apollo/client';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useLayoutEffect } from 'react';
import { LOGIN } from '../lib/apollo/auth';
import { User, withAuth } from '../lib/withAuth';

export interface ISignInProps {
    user: User
}

export const getServerSideProps: GetServerSideProps = withAuth(
    (context: GetServerSidePropsContext) => {
        return {}
    }
);

export default function SignIn({ user }: ISignInProps) {
    const [login, { data, error, loading }] = useLazyQuery(LOGIN);
    const router = useRouter()

    useLayoutEffect(() => {
        if (user) {
            router.push('/')
        }
    }, [])

    if (user) {
        return <></>
    }

    return <div className="signin">ahihi</div>;
}
