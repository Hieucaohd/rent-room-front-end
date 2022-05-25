export type ForgotForm = {
    password: string;
    newPassword: string;
    passwordConfirm: string | undefined;
};

export type ErrorAction = {
    password: boolean;
    newPassword: boolean;
    passwordConfirm: boolean;
};
