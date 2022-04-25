import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import client from '../../lib/apollo/apollo-client';
import getSecurityCookie from '../../security';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    let user = null;
    const Cookies = getSecurityCookie(req);
    if (Cookies) {
        const { data } = await client.query({
            query: gql`
                query User {
                    profile {
                        user {
                            _id
                            fullname
                            email
                        }
                    }
                }
            `,
            context: {
                headers: {
                    Cookies,
                },
            },
        });
        user = data.profile?.user;
    }
    return {
        props: {
            user,
        },
    };
};

export default function Room({ user, data }: any) {
    return (
        <>
            <div>name: {user?._id}</div>
            <div>fullname: {user?.fullname}</div>
            <div>email: {user?.email}</div>
        </>
    );
}
