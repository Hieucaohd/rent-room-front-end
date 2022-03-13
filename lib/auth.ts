import { gql } from '@apollo/client';

export const REGISTER = gql`
    mutation REGISTER($email: String!, $password: String!, $fullname: String!) {
        register(
            newUser: {
                email: email
                password: password
                fullname: fullname
            }
        ) {
            user {
                _id
                email
            }
            token
        }
    }
`;
