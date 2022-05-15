export interface FormSignUp {
    email: string;
    password: string;
    passwordConfirm: string;
    userType: 'TENANT' | 'HOST';
    fullname: string;
    callNumber: string;
    province: string | undefined;
    district: string | undefined;
    ward: string | undefined;
}

export interface FormSignUpError {
    email?: boolean;
    password?: boolean;
    passwordConfirm?: boolean;
    fullname?: boolean;
    callNumber?: boolean;
    province?: boolean;
    district?: boolean;
    ward?: boolean;
}
