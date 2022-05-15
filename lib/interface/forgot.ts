export type ForgotForm = {
    password: string;
    passwordConfirm: string | undefined;
};

export type ErrorAction = {
    password: boolean;
    passwordConfirm: boolean;
};
