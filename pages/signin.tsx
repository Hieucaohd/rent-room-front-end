import { useRouter } from 'next/router';
import React from 'react';
import client from '../lib/apollo/apollo-client';
import { LOGIN } from '../lib/apollo/auth';
import { UserStore, useStore } from '../store/store';

export interface ISignInProps {}

export default function SignIn(props: ISignInProps) {
    const setUser = useStore((state:UserStore) => state.setUser);
    const router = useRouter();
    const onFinish = async (values: any) => {
        try {
            const data = await client.query({
                query: LOGIN,
                variables: {email: values.email, password: values.password}
            })
            setUser(data.data.login.user);
            router.push("/")
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="signin">
            
        </div>
    );
}
