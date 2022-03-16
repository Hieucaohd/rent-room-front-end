import { gql } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { UserStore, useStore } from '../store/store';
import client from './apollo-client';

function useAuth() {
    const [isLoading, setIsLoading] = useState(true);
    const setUser = useStore((state:UserStore) => state.setUser);
    useEffect(() => {
        async function getData () {
            try {
                const data = await client.query({
                    query: gql`
                        query PROFILE {
                            profile {
                                user {
                                    _id
                                    email
                                    fullname
                                }
                                isAuth
                            }
                        }
                    `,
                });
                setUser(data.data.profile.user);
                setIsLoading(false);
            } catch (e) {
                console.log(e);
                setIsLoading(false);
            }
        };
        getData();
    }, [])

    return isLoading;
}
export default useAuth;
