import { GetServerSidePropsContext } from 'next';
import client from './apollo/apollo-client';
import { PROFILE } from './apollo/auth';

const checkLoggedIn = async (Cookie: string) => {
    try {
        if (!Cookie.includes('token') || !Cookie.includes('refreshToken')) {
            return null;
        }

        const data = await client.query({
            query: PROFILE,
            context: { headers: { Cookie } },
        });

        return data.data.profile.user;
    } catch (e: any) {
        return null;
    }
};

export function withAuth(gssp: any) {
    return async (context: GetServerSidePropsContext) => {
        const Cookie = context.req.headers.cookie;
        const [user, currentProps] = await Promise.all([checkLoggedIn(Cookie || ''), gssp(context)])
        return {
            props: {
                ...currentProps,
                user,
            },
        };
    };
}
