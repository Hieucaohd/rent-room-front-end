import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useState } from 'react';
import FilterBar from '../../components/Search/FilterBar';
import SearchList from '../../components/Search/SearchList';
import SelectProvince from '../../components/Search/SelectProvince';
import { getFilterRoom } from '../../lib/apollo/search';
import { getSearchPlaceName } from '../../lib/getPosition';
import { isBrowser } from 'react-device-detect';

const SearchMap = dynamic(() => import('../../components/Search/SearchMap'), { ssr: false });

export interface Room {
    __typename: string;
    _id: string;
    home: any;
    price: number;
    square: number;
    isRented: Boolean;
    floor: number;
    images: [string];
    description: string;
    roomNumber: string;
    createdAt: string;
    title: string;
}

export interface Paginator {
    __typename: string;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    page: number;
    totalDocs: number;
    totalPages: number;
}

export interface ISearchProps {
    roomList: [Room];
    address: {
        name: string;
        province: string;
        district: string;
        ward: string;
    };
    paginator: Paginator;
}

export default function Search({ roomList, address, paginator }: ISearchProps) {
    const [showSelect, setShowSelect] = useState(false);
    return (
        <div className="search">
            <Head>
                <title>{address.name ? `Phòng trọ ở ${address.name}` : 'Tìm kiếm'}</title>
            </Head>
            {isBrowser && (
                <SearchMap
                    roomList={getMapRoomList(roomList)}
                    address={address}
                    onShowSelect={() => setShowSelect(true)}
                />
            )}
            <div className="search__room">
                <FilterBar />
                <SearchList roomList={roomList} paginator={paginator} />
            </div>
            {(!address || showSelect) && (
                <SelectProvince disableSelect={() => setShowSelect(false)} />
            )}
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    try {
        const { province, district, ward, page } = query;
        const address = await getSearchPlaceName(province, district, ward);
        const { filterRoom } = await getFilterRoom(searchQuery(query), Number(page));
        return {
            props: {
                roomList: filterRoom.docs,
                paginator: filterRoom.paginator,
                address: {
                    name: address,
                    province: province || null,
                    district: district || null,
                    ward: ward || null,
                },
            },
        };
    } catch (e: any) {
        return {
            props: {
                roomList: [],
                address: '',
                paginator: {
                    page: 0,
                    totalPage: 0,
                    totalDocs: 0,
                },
            },
        };
    }
};

const searchQuery = (query: any) => {
    let {
        province,
        district,
        ward,
        minPrice,
        maxPrice,
        arrangePrice,
        floor,
        liveWithOwner,
        minSquare,
        maxSquare,
        arrangeSquare,
        createdAt,
        minWaterPrice,
        maxWaterPrice,
        arrangeWaterPrice,
        minElectricityPrice,
        maxElectricityPrice,
        arrangeElectricityPrice,
    } = query;

    if (minPrice && !maxPrice) {
        maxPrice = 999999999;
    }
    if (maxPrice && !minPrice) {
        minPrice = 1;
    }
    if (minWaterPrice && !maxWaterPrice) {
        maxWaterPrice = 999999999;
    }
    if (maxWaterPrice && !minWaterPrice) {
        minWaterPrice = 1;
    }
    if (minElectricityPrice && !maxElectricityPrice) {
        maxElectricityPrice = 999999999;
    }
    if (maxElectricityPrice && !minElectricityPrice) {
        minElectricityPrice = 1;
    }
    if (minSquare && !maxSquare) {
        maxSquare = 999999999;
    }
    if (maxSquare && !minSquare) {
        minSquare = 1;
    }

    const isFilterWater = minWaterPrice || maxWaterPrice || arrangeWaterPrice;
    const isFilterElectricity =
        minElectricityPrice || maxElectricityPrice || arrangeElectricityPrice;

    return {
        address: {
            ...(province && { province: Number(province) }),
            ...(district && { district: Number(district) }),
            ...(ward && { ward: Number(ward) }),
        },
        ...((minPrice || maxPrice || arrangePrice) && {
            price: {
                ...((minPrice || maxPrice) && {
                    scope: {
                        ...(minPrice && { min: Number(minPrice) }),
                        ...(maxPrice && { max: Number(maxPrice) }),
                    },
                }),
                ...(arrangePrice && {
                    arrange: arrangePrice,
                }),
            },
        }),
        ...(floor && { floor: Number(floor) }),
        ...(liveWithOwner && { liveWithOwner: liveWithOwner === '0' ? true : false }),
        ...((minSquare || maxSquare || arrangeSquare) && {
            square: {
                ...((minSquare || maxSquare) && {
                    scope: {
                        ...(minSquare && { min: Number(minSquare) }),
                        ...(maxSquare && { max: Number(maxSquare) }),
                    },
                }),
                ...(arrangeSquare && {
                    arrange: arrangeSquare,
                }),
            },
        }),
        ...(createdAt && { createdAt: createdAt }),
        ...((isFilterWater || isFilterElectricity) && {
            livingExpenses: {
                ...(isFilterWater && {
                    waterCondition: {
                        ...((minWaterPrice || maxWaterPrice) && {
                            scope: {
                                ...(minWaterPrice && { min: Number(minWaterPrice) }),
                                ...(maxWaterPrice && { max: Number(maxWaterPrice) }),
                            },
                        }),
                        ...(arrangeWaterPrice && {
                            arrange: arrangeWaterPrice,
                        }),
                    },
                }),
                ...(isFilterElectricity && {
                    electricityCondition: {
                        ...((minElectricityPrice || maxElectricityPrice) && {
                            scope: {
                                ...(minElectricityPrice && { min: Number(minElectricityPrice) }),
                                ...(maxElectricityPrice && { max: Number(maxElectricityPrice) }),
                            },
                        }),
                        ...(arrangeElectricityPrice && {
                            arrange: arrangeElectricityPrice,
                        }),
                    },
                }),
            },
        }),
    };
};

const getMapRoomList = (roomList: Room[]) => {
    return roomList.filter((room) => room.home.position !== null);
};