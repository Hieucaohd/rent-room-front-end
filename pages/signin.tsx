import { gql } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import client from '../lib/apollo/apollo-client';
import { LOGIN } from '../lib/apollo/auth';

export interface ISignInProps {}

export default function SignIn(props: ISignInProps) {
    const router = useRouter();
    const onFinish = async (e:any, values: any) => {
        e.preventDefault();
        try {
            const data = await client.query({
                query: LOGIN,
                variables: { email: values.email, password: values.password },
            });
            router.push('/');
        } catch (err) {
            console.log(err);
        }
    };
    
    return <div className="signin">
         <Link href="/signup">
          <a>Home</a>
        </Link>
        <button onClick={(e) => onFinish(e, {email: "test1@gmail.com", password: "123456"})}>Test</button>
    </div>;
}
