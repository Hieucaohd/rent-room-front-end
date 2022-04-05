import { gql } from '@apollo/client';
import client from '../apollo-client';

export const getHomeById = {
    command: gql`
        query GetHomeById($homeId: ID!) {
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
                totalRooms
                position {
                    lng
                    lat
                }
            }
        }
    `,
    variables: (homeId: string) => ({
        homeId,
    }),
};

export default async function getSSRHomeById(id: string) {
    const { data } = await client.query({
        query: getHomeById.command,
        variables: getHomeById.variables(id),
    });

    return data.getHomeById;
}
