import { GetServerSidePropsContext } from 'next';
import client from './apollo/apollo-client';
import { PROFILE } from './apollo/auth';

const checkLoggedIn = async (Cookie: string) => {
    if (!Cookie.includes('token') || !Cookie.includes('refreshToken')) {
        return null;
    }

    const data = await client.query({
        query: PROFILE,
        context: { headers: { Cookie } },
    });

    return data.data.profile.user;
};

export function withAuth(gssp: any) {
    return async (context: GetServerSidePropsContext) => {
        const Cookie = context.req.headers.cookie;

        const user = await checkLoggedIn(Cookie || '');

        const currentProps = await gssp(context);

        return {
            props: {
                ...currentProps,
                user,
            },
        };
    };
}
