import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { Paginator, Room } from '../../../pages/search';
import Pagination from './Pagination';
import SearchRoom from './SearchRoom';
import styles from './styles.module.scss';

export interface ISearchListProps {
    roomList: Room[];
    paginator: Paginator;
}

export default function SearchList({ roomList, paginator }: ISearchListProps) {
    const listRef = useRef<any>();
    const router = useRouter();
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
            {roomList.map((room, index) => (
                <SearchRoom room={room} key={index} index={index} />
            ))}
            <Pagination onChangePage={changePage} paginator={paginator}/>
        </ul>
    );
}
