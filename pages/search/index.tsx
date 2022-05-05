import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useState } from 'react';
import FilterBar from '../../components/Search/FilterBar';
import SearchList from '../../components/Search/SearchList';
import SelectProvince from '../../components/Search/SelectProvince';
import { getFilterRoom } from '../../lib/apollo/search';
import { getSearchPlaceName } from '../../lib/getPosition';
import { Paginator, Room } from '../../lib/interface';
import { useMediaQuery } from '@chakra-ui/react';

const SearchMap = dynamic(() => import('../../components/Search/SearchMap'), { ssr: false });

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
    const [isMobile] = useMediaQuery('(max-width: 768px)');
    
    return (
        <div className="search">
            <Head>
                <title>{address.name ? `Phòng trọ ở ${address.name}` : 'Tìm kiếm'}</title>
            </Head>
            {!isMobile && (
                <SearchMap
                    roomList={getMapRoomList(roomList)}
                    address={address}
                    onShowSelect={() => setShowSelect(true)}
                />
            )}
            <div className="search__room">
                <FilterBar />
                <SearchList
                    roomList={roomList}
                    paginator={paginator}
                    address={address.name}
                    onShowSelect={() => setShowSelect(true)}
                />
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
        const { filterRoom } = await getFilterRoom(searchQuery(query), Number(page), 10);
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
        floor,
        liveWithOwner,
        minSquare,
        maxSquare,
        minWaterPrice,
        maxWaterPrice,
        minElectricityPrice,
        maxElectricityPrice,
        sort,
    } = query;

    const isFilterWater = minWaterPrice || maxWaterPrice;
    const isFilterElectricity = minElectricityPrice || maxElectricityPrice;
    const isFilterPrice = minPrice || maxPrice || sort === 'ASC' || sort === 'DESC';

    return {
        address: {
            ...(province && { province: Number(province) }),
            ...(district && { district: Number(district) }),
            ...(ward && { ward: Number(ward) }),
        },
        ...(isFilterPrice && {
            price: {
                ...((minPrice || maxPrice) && {
                    scope: {
                        ...(minPrice && { min: Number(minPrice) }),
                        ...(maxPrice && { max: Number(maxPrice) }),
                    },
                }),
                ...((sort === 'asc' || sort === 'desc') && {
                    arrange: sort.toUpperCase(),
                }),
            },
        }),
        ...(floor && { floor: Number(floor) }),
        ...(liveWithOwner && { liveWithOwner: liveWithOwner === '0' ? true : false }),
        ...((minSquare || maxSquare) && {
            square: {
                ...((minSquare || maxSquare) && {
                    scope: {
                        ...(minSquare && { min: Number(minSquare) }),
                        ...(maxSquare && { max: Number(maxSquare) }),
                    },
                }),
            },
        }),
        ...(sort === 'oldest' && { createdAt: 'ASC' }),
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
                    },
                }),
            },
        }),
    };
};

const getMapRoomList = (roomList: Room[]) => {
    return roomList.filter((room) => room.home.position !== null);
};
