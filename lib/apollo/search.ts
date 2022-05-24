import { gql } from '@apollo/client';
import client from '@lib/apollo/apollo-client';

export const getFilterRoom = async (conditions: any, page: number, limit: number) => {
    const SEARCH = gql`
        query filterRoom($conditions: FilterRoomInput!, $page: Int, $limit: Int) {
            filterRoom(conditions: $conditions, page: $page, limit: $limit) {
                docs {
                    _id
                    home {
                        _id
                        province
                        district
                        ward
                        provinceName
                        districtName
                        wardName
                        waterPrice
                        electricityPrice
                        position {
                            lat
                            lng
                        }
                        owner {
                            _id
                            fullname
                        }
                    }
                    title
                    price
                    square
                    isRented
                    amenities {
                        title
                    }
                    floor
                    images
                    description
                    roomNumber
                    createdAt
                }
                paginator {
                    hasNextPage
                    hasPrevPage
                    page
                    totalDocs
                    totalPages
                }
            }
        }
    `;
    const { data } = await client.query({
        query: SEARCH,
        variables: { conditions, page, limit },
        fetchPolicy: 'no-cache',
    });

    return data;
};
