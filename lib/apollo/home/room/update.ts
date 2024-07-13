import { gql } from '@apollo/client';

export const updateRoomImages = {
    command: gql`
        mutation Mutation($updatedRoom: RoomUpdateInput!) {
            updateRoom(input: $updatedRoom) {
                ... on Room {
                    images
                }
            }
        }
    `,
    variables: (images: string[], updateRoomId: any) => {
        return {
            updatedRoom: {
                images,
                id: updateRoomId,
            },
        };
    },
};

export interface UpdateRoomTitle {
    roomNumber: number | undefined;
    price: number | undefined;
    square: number | undefined;
    isRented: boolean | undefined;
    floor: number | undefined;
    images: any[] | undefined;
}

export const updateRoomTitle = {
    command: gql`
        mutation Mutation($updatedRoom: RoomUpdateInput!) {
            updateRoom(input: $updatedRoom) {
                ... on Room {
                    roomNumber
                    price
                    square
                    isRented
                    floor
                }
            }
        }
    `,
    variables: (updatedRoom: any, updateRoomId: string) => ({
        updatedRoom: { ...updatedRoom, id: updateRoomId },
    }),
};

export const updateRoomDescription = {
    command: gql`
        mutation Mutation($updatedRoom: RoomUpdateInput!) {
            updateRoom(input: $updatedRoom) {
                ... on Room {
                    description
                }
            }
        }
    `,
    variables: (des: string, updateRoomId: any) => {
        return {
            updatedRoom: {
                description: des,
                id: updateRoomId,
            },
        };
    },
};

export interface Amenity {
    title: string;
}

export const updateRoomAmenity = {
    command: gql`
        mutation UpdateRoom($updateRoomUpdatedRoom2: RoomUpdateInput!) {
            updateRoom(input: $updateRoomUpdatedRoom2) {
                ... on Room {
                    amenities {
                        title
                    }
                }
            }
        }
    `,
    variables: (amenities: Amenity[], roomId: string) => ({
        updateRoomUpdatedRoom2: {
            amenities: amenities,
            id: roomId,
        },
    }),
};
