import dynamic from 'next/dynamic';
import { RoomData } from '@lib/interface';
import styles from './styles.module.scss';

const Slider = dynamic(() => import('@components/Slider'), { ssr: false });

export interface IRoomByAreaProps {
    label: string;
    roomList: RoomData[];
}

export default function RoomByArea({ label, roomList }: IRoomByAreaProps) {
    return (
        <div className={styles.container}>
            <label>{label}</label>
            <div className={styles.list}>
                {roomList.map((room) => (
                    <div className={styles.item}>
                        <Slider
                            width={'100%'}
                            height={'100%'}
                            images={room.images}
                            showPreview={true}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
