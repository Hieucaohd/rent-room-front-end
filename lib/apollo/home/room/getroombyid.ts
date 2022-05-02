import { gql } from '@apollo/client';
import { HomeData } from '../../../../pages/home/[homeid]';
import { Amenity } from './update';

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
    amenities: Amenity[];
}

export const getSSRRoomById = {
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
                    title
                    provinceName
                    districtName
                    wardName
                    province
                    district
                    ward
                    electricityPrice
                    waterPrice
                    internetPrice
                    cleaningPrice
                    position {
                        lng
                        lat
                    }
                }
                price
                square
                isRented
                floor
                images
                description
                roomNumber
                amenities {
                    title
                }
            }
        }
    `,
    variables: (roomId: string) => {
        return {
            roomId: roomId,
        };
    },
};
