import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { useMutation } from '@apollo/client';
import { REGISTER } from '../lib/auth';
import userStore from '../store/userStore';

export interface ISignUpProps {}

export default function SignUp(props: ISignUpProps) {
    const [register] = useMutation(REGISTER);
    const setUser = userStore(state => state.setUser);

    const onFinish = async (values: any) => {
        try {
            const userData:any = await register({variables: {email: values.email, password: values.password, fullname: values.fullname}})
            setUser(userData?.data?.register?.user);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            type: 'email',
                            message: 'Nhập đúng email!',
                        },
                        {
                            required: true,
                            message: 'Cần nhập email!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Cần nhập mật khẩu!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    label="Tên"
                    name="fullname"
                    rules={[{ required: true, message: 'Cần nhập tên!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="remember"
                    valuePropName="checked"
                    wrapperCol={{ offset: 8, span: 16 }}
                >
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}