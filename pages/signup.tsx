import React from 'react';
import { Button } from 'antd';

export interface ISignUpProps {}

export default function SignUp(props: ISignUpProps) {
    return (
        <div>
            <Button type="primary">Đăng kí</Button>
        </div>
    );
}
