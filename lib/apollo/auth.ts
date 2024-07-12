import { gql } from '@apollo/client';

export const LOGIN = gql`
    query LOGIN($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            ... on User {
                _id
                email
                fullname
            }
        }
    }
`;

export const SIGNUP = gql`
    mutation Register($newUser: UserCreateInput!) {
        register(input: $newUser) {
            ... on User {
                _id
            }
        }
    }
`;

export const LOGOUT = gql`
    mutation LOGOUT {
        logout {
            ... on UserNotAuthenticatedError {
                errorCode
                message
            }
            ... on LogoutStatus {
                success
            }
        }
    }
`;

export const PROFILE = gql`
    query Profile {
        profile {
            isAuth
            user {
                avatar
                fullname
                email
                numberPhone
                province
                district
                ward
                _id
                userType
            }
        }
    }
`;
