import { useMediaQuery } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { Paginator, Room } from '@lib/interface';
import Pagination from './Pagination';
import SearchRoom from './SearchRoom';
import styles from './styles.module.scss';

export interface ISearchListProps {
    roomList: Room[];
    paginator: Paginator;
    address: string;
    onShowSelect: Function;
}

export default function SearchList({
    roomList,
    paginator,
    address,
    onShowSelect,
}: ISearchListProps) {
    const listRef = useRef<any>();
    const router = useRouter();
    const [isMobile] = useMediaQuery('(max-width: 600px)');

    useEffect(() => {
        listRef.current.scrollTop = 0;
    }, [router.query]);

    const changePage = (page: number) => {
        router.push({
            pathname: 'search',
            query: { ...router.query, page },
        });
    };

    return (
        <ul className={styles.list} ref={listRef}>
            <p className={styles.list__address}>
                Có <strong>{paginator.totalDocs || 0}</strong> phòng trọ tại
                <strong onClick={() => onShowSelect()}>
                    {address} {isMobile && <i className="fa-solid fa-pen-to-square"></i>}
                </strong>
            </p>
            {roomList.map((room, index) => (
                <SearchRoom room={room} key={index} index={index} isSearchPage={true} />
            ))}
            <Pagination onChangePage={changePage} paginator={paginator} />
        </ul>
    );
}
