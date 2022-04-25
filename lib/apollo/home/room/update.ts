import { gql } from '@apollo/client';

export const updateRoomImages = {
    command: gql`
        mutation Mutation($updatedRoom: RoomInput!, $updateRoomId: ID!) {
            updateRoom(updatedRoom: $updatedRoom, id: $updateRoomId) {
                images
            }
        }
    `,
    variables: (images: string[], updateRoomId: any) => {
        return {
            updatedRoom: {
                images,
            },
            updateRoomId,
        };
    },
};

export default {};
