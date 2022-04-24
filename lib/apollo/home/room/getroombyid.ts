import { gql } from '@apollo/client';
import { HomeData } from '../../../../pages/home/[homeid]';

export interface RoomData {
    _id: string;
    home: HomeData;
    price: number;
    square: number;
    isRented: boolean;
    floor: number;
    images: string[];
    description: string;
    roomNumber: string;
}

const getSSRRoomById = {
    command: gql`
        query GetZoomById($roomId: ID!) {
            getRoomById(roomId: $roomId) {
                _id
                home {
                    _id
                    owner {
                        _id
                        fullname
                        avatar
                    }
                    provinceName
                    districtName
                    wardName
                    electricityPrice
                    waterPrice
                    internetPrice
                    cleaningPrice
                }
                price
                square
                isRented
                floor
                images
                description
                roomNumber
            }
        }
    `,
    variables: (roomId: string) => {
        return {
            roomId: roomId,
        };
    },
};

export default getSSRRoomById;
