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
    images: any[] | undefined
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

export const updateRoomDescription = {
    command: gql`
        mutation Mutation($updatedRoom: RoomUpdateInput!, $updateRoomId: ID!) {
            updateRoom(updatedRoom: $updatedRoom, id: $updateRoomId) {
                description
            }
        }
    `,
    variables: (des: string, updateRoomId: any) => {
        return {
            updatedRoom: {
                description: des,
            },
            updateRoomId,
        };
    },
};
