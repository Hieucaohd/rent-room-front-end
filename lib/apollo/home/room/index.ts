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
        mutation Mutation($newRoom: RoomInput!, $homeId: ID!) {
            createNewRoom(newRoom: $newRoom, homeId: $homeId) {
                _id
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
        },
        homeId,
    }),
};

export default {};
export * from './update'
export * from './getroombyid'