import { from, gql } from '@apollo/client';

export interface AddZoomForm {
    price: number;
    square: number;
    floor: number;
    zoomnumber: number;
    images: any[];
}

export const createZoom = {
    command: gql`
        mutation Mutation($newRoom: RoomCreateInput!) {
            createRoom(input: $newRoom) {
                ... on Room {
                    _id
                }
            }
        }
    `,
    variables: (e: AddZoomForm, homeId: string) => ({
        newRoom: {
            price: e.price,
            square: e.square,
            isRented: false,
            floor: e.floor,
            images: e.images,
            roomNumber: e.zoomnumber,
            home: homeId,
        },
    }),
};

export const deleteRoomById = {
    command: gql`
        mutation UpdateRoom($deleteRoomId: ID!) {
            deleteRoom(id: $deleteRoomId) {
                ... on AfterDelete {
                    id
                    success
                }
                ... on InstanceNotExistError {
                    errorCode
                    message
                }
                ... on PermissionDeninedError {
                    errorCode
                    message
                }
            }
        }
    `,
    variables: (roomId: string) => ({
        deleteRoomId: roomId,
    }),
};

export default {};
export * from './update';
export * from './getroombyid';
