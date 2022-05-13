import { gql } from '@apollo/client';
import { HomeData } from '@pages/home/[homeid]';
import client from '@lib/apollo/apollo-client';
import { Amenity } from '@lib/apollo/home/room/update';

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
                        numberPhone
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

export const getRoomByIds = {
    command: gql`
        query GetListRoomByIds($listIds: [ID!]!, $page: Int, $limit: Int) {
            getListRoomByIds(listIds: $listIds, page: $page, limit: $limit) {
                docs {
                    _id
                    price
                    square
                    isRented
                    floor
                    images
                    roomNumber
                }
                paginator {
                    limit
                    page
                    nextPage
                    prevPage
                    totalPages
                    pagingCounter
                    hasPrevPage
                    hasNextPage
                    totalDocs
                }
            }
        }
    `,
    variables: (listIds: string[], page?: number, limit?: number) => {
        page ??= 1;
        limit ??= 12;

        return {
            listIds,
            page,
            limit,
        };
    },
};

export const getListRoomByIds = async (listRoom: string[], page: number) => {
    try {
        const { data } = await client.query({
            query: getRoomByIds.command,
            variables: getRoomByIds.variables(listRoom, page, 12),
        });
        return data.getListRoomByIds;
    } catch (error) {
        console.log(error);
    }
};
