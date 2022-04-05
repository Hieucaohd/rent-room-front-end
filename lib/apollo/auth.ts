import { gql } from '@apollo/client';

export const LOGIN = gql`
    query LOGIN($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            user {
                _id
                email
                fullname
            }
        }
    }
`;

export const SIGNUP = gql`
    mutation Register($newUser: UserInput!) {
        register(newUser: $newUser) {
            user {
                _id
            }
        }
    }
`;

export const LOGOUT = gql`
    mutation LOGOUT {
        logout {
            status
        }
    }
`;

export const PROFILE = gql`
    query Profile {
        profile {
            isAuth
            user {
                fullname
                email
                numberPhone
                province
                district
                ward
                _id
            }
        }
    }
`;
