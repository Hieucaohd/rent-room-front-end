import useClassName from '../../lib/useClassName';
import styles from './style.module.scss';

interface EmptyDataProps {
    text?: string;
}

export default function EmptyData({ text = 'chưa có dữ liệu' }: EmptyDataProps) {
    const [className] = useClassName(styles);
    return (
        <div {...className('empty-data')}>
            <i className="fi fi-br-browser"></i>
            {text}
        </div>
    );
}
