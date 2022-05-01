import { gql } from '@apollo/client';

export const updateRoomImages = {
    command: gql`
        mutation Mutation($updatedRoom: RoomUpdateInput!, $updateRoomId: ID!) {
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

export interface UpdateRoomTitle {
    roomNumber: number | undefined;
    price: number | undefined;
    square: number | undefined;
    isRented: boolean | undefined;
    floor: number | undefined;
}

export const updateRoomTitle = {
    command: gql`
        mutation Mutation($updatedRoom: RoomUpdateInput!, $updateRoomId: ID!) {
            updateRoom(updatedRoom: $updatedRoom, id: $updateRoomId) {
                roomNumber
                price
                square
                isRented
                floor
            }
        }
    `,
    variables: (updatedRoom: any, updateRoomId: string) => ({
        updatedRoom,
        updateRoomId,
    }),
};
