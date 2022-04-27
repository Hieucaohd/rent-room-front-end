import { gql } from '@apollo/client';

export interface NewHome {
    province: any;
    district: any;
    ward: any;
    liveWithOwner: any;
    electricityPrice: any;
    waterPrice: any;
    images: any[];
    totalRooms: number;
}

export const createNewHome = {
    command: gql`
        mutation CreateNewHome($newHome: HomeInput!) {
            createNewHome(newHome: $newHome) {
                _id
            }
        }
    `,
    variable: (data: NewHome, position: [number, number]) => {
        return {
            newHome: {
                province: data.province,
                district: data.district,
                ward: data.ward,
                liveWithOwner: data.liveWithOwner,
                electricityPrice: data.electricityPrice,
                waterPrice: data.waterPrice,
                images: data.images,
                totalRooms: data.totalRooms,
                position: {
                    x: 0.0,
                    y: 0.0,
                    lng: parseFloat(position[0].toString()),
                    lat: parseFloat(position[1].toString()),
                },
            },
        };
    },
};

export const getUserHomes = {
    command: gql`
        query Profile($page: Int, $limit: Int) {
            profile {
                user {
                    listHomes(page: $page, limit: $limit) {
                        docs {
                            _id
                            province
                            district
                            ward
                            provinceName
                            districtName
                            wardName
                            liveWithOwner
                            electricityPrice
                            waterPrice
                            images
                            totalRooms
                            internetPrice
                            cleaningPrice
                            totalRooms
                            title
                            position {
                                lng
                                lat
                            }
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
    variable: (page: string, limit: number) => {
        const currentPage = parseInt(page);
        if (isNaN(currentPage)) {
            throw new Error('wrong page');
        }
        return {
            page: currentPage,
            limit,
        };
    },
};

export const deleteHome = {
    command: gql`
        mutation DeleteHome($deleteHomeId: ID!) {
            deleteHome(id: $deleteHomeId)
        }
    `,
    variable: (_id: string) => ({
        deleteHomeId: _id,
    }),
};

export default {};
