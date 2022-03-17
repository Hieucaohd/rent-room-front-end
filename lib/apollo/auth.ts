import { gql } from "@apollo/client";

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

export const LOGOUT = gql`
    mutation LOGOUT {
        logout {
            status
        }
    }
`;