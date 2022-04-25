import ReactPaginate from 'react-paginate';
import { Paginator } from '../../../pages/search';
import styles from './styles.module.scss';

export interface IPaginationProps {
    onChangePage: (page: number) => void;
    paginator: Paginator;
}

export default function Pagination({ onChangePage, paginator }: IPaginationProps) {
    return (
        <div className={styles.pagination}>
            <ReactPaginate
                breakLabel="..."
                nextLabel=">>"
                pageRangeDisplayed={5}
                previousLabel="<<"
                onPageChange={({selected}) => onChangePage(selected + 1)}
                pageCount={paginator.totalPages}
                initialPage={paginator.page - 1}
                disableInitialCallback={true}
            />
        </div>
    );
}