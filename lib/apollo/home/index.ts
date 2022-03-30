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
    variable: (data: NewHome) => {
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
            },
        };
    },
};

export const getUserHomes = {
    command: gql`
        query Profile {
            profile {
                user {
                    listHomes {
                        docs {
                            _id
                            province
                            district
                            ward
                            liveWithOwner
                            electricityPrice
                            waterPrice
                            images
                            totalRooms
                        }
                    }
                }
            }
        }
    `,
    variable: (data: NewHome) => {
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
            },
        };
    },
};

export default {};
