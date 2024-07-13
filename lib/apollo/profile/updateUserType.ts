import { gql } from '@apollo/client';

export const updateUserType = {
    command: gql`
        mutation UpdateUser($updateInfo: UserUpdateInput!) {
            updateUser(input: $updateInfo) {
                ... on User {
                    userType
                }
            }
        }
    `,
    variables: () => ({
        updateInfo: {
            userType: 'HOST',
        },
    }),
};
