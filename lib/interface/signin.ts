export interface LoginForm {
    email: string;
    password: string;
}

export interface ErrorLog {
    type: 'user' | 'password' | 'all';
    message: string | string[] | null;
}
