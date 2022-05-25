export const isPassword = (password: string) => {
    const pw_regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return !pw_regex.test(password);
};
