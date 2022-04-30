import useClassName from '../../lib/useClassName';
import styles from './style.module.scss';

interface EmptyDataProps {
    text?: string;
}

export default function EmptyData({ text = 'chưa có dữ liệu' }: EmptyDataProps) {
    const [className] = useClassName(styles);
    return (
        <div {...className('empty-data')}>
            <i className="fa-solid fa-rectangle-xmark"></i>
            {text}
        </div>
    );
}
