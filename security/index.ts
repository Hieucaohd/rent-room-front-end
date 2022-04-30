import { IncomingMessage } from 'http';
import jwtDecode from 'jwt-decode';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

interface UserCookie {
    token: string;
    refreshToken: string;
}

export default function getSecurityCookie(
    req: IncomingMessage & {
        cookies: NextApiRequestCookies;
    }
) {
    const { access_token, refresh_token } = req.cookies;
    const Cookies = req.headers.cookie;
    if (access_token && refresh_token) {
        try {
            const tokenData: { exp: number } = jwtDecode(access_token);
            const refreshTokenData: { exp: number } = jwtDecode(refresh_token);
            const exp = Date.now();
            if (exp > refreshTokenData.exp * 1000) {
                if (exp > tokenData.exp * 1000) {
                    return;
                }
            }
            if (Cookies) {
                return Cookies;
            }
        } catch (error) {}
    }
}
