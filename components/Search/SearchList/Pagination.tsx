import ReactPaginate from 'react-paginate';
import { Paginator } from '../../../lib/interface';
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
                pageCount={paginator.totalPages || 1}
                initialPage={paginator.page === 0 ? 0 : paginator.page - 1}
                onPageChange={({selected}) => onChangePage(selected + 1)}
                disableInitialCallback={true}
            />
        </div>
    );
}