import React from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apollo-client';

export interface ISignInProps {}

export default function SignIn(props: ISignInProps) {
    console.log(props);
    return <div>signin</div>;
}
