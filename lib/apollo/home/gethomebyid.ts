import { gql } from '@apollo/client';
import client from '@lib/apollo/apollo-client';

export const getHomeById = {
    command: gql`
        query GetHomeById($homeId: ID!, $page: Int!, $limit: Int!) {
            getHomeById(id: $homeId) {
                ... on Home {
                    _id
                    title
                    owner {
                        _id
                        fullname
                        avatar
                        numberPhone
                    }
                    provinceName
                    districtName
                    wardName
                    province
                    district
                    ward
                    liveWithOwner
                    electricityPrice
                    waterPrice
                    images
                    internetPrice
                    cleaningPrice
                    minPrice
                    maxPrice
                    totalRooms
                    description
                    position {
                        lng
                        lat
                    }
                    listRooms(paginatorOptions: { page: $page, limit: $limit }) {
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
