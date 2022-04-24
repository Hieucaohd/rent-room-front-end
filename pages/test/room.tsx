import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import client from '../../lib/apollo/apollo-client';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
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
    });
    const user = data.profile?.user
    return {
        props: {
            user
        },
    };
};

export default function room({user}: any) {
    return <>
        <div>name: {user?._id}</div>
        <div>fullname: {user?.fullname}</div>
        <div>email: {user?.email}</div>
    </>;
}
