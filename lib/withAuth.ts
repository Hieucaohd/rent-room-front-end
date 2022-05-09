import { GetServerSidePropsContext } from 'next';
import client from './apollo/apollo-client';
import { PROFILE } from './apollo/auth';

export interface User {
    _id: string;
    avatar: string;
    email: string;
    fullname: string;
    province: number;
    provinceName: string;
    district: number;
    districtName: string;
    ward: number;
    wardName: string;
    numberPhone: string;
    position: {
        lng: number;
        lat: number;
    };
    userType: 'HOST' | 'TENANT';
}

export const checkLoggedIn = async (Cookie: string) => {
    try {
        if (!Cookie.includes('access_token') || !Cookie.includes('refresh_token')) {
            return null;
        }

        const data = await client.query({
            query: PROFILE,
            context: { headers: { Cookie } },
            fetchPolicy: 'no-cache',
        });

        return data.data.profile.user;
    } catch (e: any) {
        console.log(e);
        return null;
    }
};

export function withAuth(gssp: any) {
    return async (context: GetServerSidePropsContext) => {
        const Cookie = context.req.headers.cookie;
        const [user, currentProps] = await Promise.all([
            checkLoggedIn(Cookie || ''),
            gssp(context),
        ]);
        return {
            props: {
                ...currentProps,
                user,
            },
        };
    };
}
