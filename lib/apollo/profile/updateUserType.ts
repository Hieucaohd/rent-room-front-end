import { gql } from '@apollo/client';

export const updateUserType = {
    command: gql`
        mutation UpdateUser($updateInfo: UserUpdateInput!) {
            updateUser(updateInfo: $updateInfo) {
                userType
            }
        }
    `,
    variables: () => ({
        updateInfo: {
            userType: 'HOST',
        },
    }),
};
