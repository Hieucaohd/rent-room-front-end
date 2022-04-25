import { gql } from '@apollo/client';
import client from './apollo-client';

export const getFilterRoom = async (conditions: any, page: number) => {
    const SEARCH = gql`
        query filterRoom($conditions: FilterRoomInput!, $page: Int) {
            filterRoom(conditions: $conditions, page: $page, limit: 10) {
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
        variables: { conditions, page },
    });

    return data;
};
