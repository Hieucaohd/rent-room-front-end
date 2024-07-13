import { gql } from '@apollo/client';

export interface HomePrices {
    electricityPrice: any;
    waterPrice: any;
    internetPrice: any;
    cleaningPrice: any;
}

export const updateHomePrices = {
    command: gql`
        mutation UpdateHome($updatedHome: HomeUpdateInput!) {
            updateHome(input: $updatedHome) {
                ... on Home {
                    electricityPrice
                    waterPrice
                    internetPrice
                    cleaningPrice
                }
            }
        }
    `,
    variables: (updatedHome: HomePrices, updateHomeId: any) => {
        return {
            updatedHome: { ...updatedHome, id: updateHomeId },
        };
    },
};

export const updateHomeImages = {
    command: gql`
        mutation UpdateHome($updatedHome: HomeUpdateInput!) {
            updateHome(input: $updatedHome) {
                ... on Home {
                    images
                }
            }
        }
    `,
    variables: (images: string[], updateHomeId: any) => {
        return {
            updatedHome: {
                images: images,
                id: updateHomeId,
            },
        };
    },
};

export interface HomeLocation {
    title: string | undefined;
    province: any | undefined;
    district: any | undefined;
    ward: any | undefined;
    liveWithOwner: any;
    position:
        | {
              lng: number;
              lat: number;
              x: number;
              y: number;
          }
        | undefined;
    images: any[] | undefined;
}

export const updateHomeLocation = {
    command: gql`
        mutation UpdateHome($updatedHome: HomeUpdateInput!) {
            updateHome(input: $updatedHome) {
                ... on Home {
                    title
                    province
                    district
                    ward
                    liveWithOwner
                    position {
                        lng
                        lat
                    }
                    images
                }
            }
        }
    `,
    variables: (updatedHome: HomeLocation, updateHomeId: any) => {
        return {
            updatedHome: { ...updatedHome, id: updateHomeId },
        };
    },
};

export const updateHomeDescription = {
    command: gql`
        mutation UpdateHome($updatedHome: HomeUpdateInput!) {
            updateHome(input: $updatedHome) {
                ... on Home {
                    description
                }
            }
        }
    `,
    variables: (des: string, updateHomeId: any) => {
        return {
            updatedHome: {
                description: des,
                id: updateHomeId,
            },
        };
    },
};

export default {};
