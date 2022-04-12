import { gql } from '@apollo/client';
import client from '../apollo-client';

export const getHomeById = {
    command: gql`
        query GetHomeById($homeId: ID!, $page: Int!, $limit: Int!) {
            getHomeById(homeId: $homeId) {
                _id
                owner {
                    _id
                    fullname
                    avatar
                }
                province
                district
                ward
                liveWithOwner
                electricityPrice
                waterPrice
                images
                internetPrice
                cleaningPrice
                totalRooms
                position {
                    lng
                    lat
                }
                listRooms(page: $page, limit: $limit) {
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
                        totalDocs
                        limit
                        page
                        nextPage
                        prevPage
                        totalPages
                    }
                }
            }
        }
    `,
    variables: (homeId: string, page?: number, limit?: number) => {
        page ??= 1;
        limit ??= 12;

        return {
            homeId,
            page,
            limit,
        };
    },
};

export default async function getSSRHomeById(id: string) {
    const { data } = await client.query({
        query: getHomeById.command,
        variables: getHomeById.variables(id),
    });

    return data.getHomeById;
}
