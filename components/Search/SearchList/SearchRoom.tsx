import dynamic from 'next/dynamic';
import Link from 'next/link';
import { handleTime } from '../../../lib/date';
import { formatPrice } from '../../../lib/formatPrice';
import { Room } from '../../../pages/search';
import useSearchStore from '../../../store/searchStore';
import styles from './styles.module.scss';

const Slider = dynamic(() => import('../../Slider'), { ssr: false });

export interface ISearchRoomProps {
    room: Room;
    index: number;
}

export default function SearchRoom({ room, index }: ISearchRoomProps) {
    const { wardName, districtName, provinceName } = room.home;
    const setRoomHovered = useSearchStore((state) => state.setRoomHovered);
    return (
        <li>
            <Link href={`/room/${room._id}`}>
                <a className={styles.item} onMouseOver={() => setRoomHovered(index)}>
                    <div className={styles.slider}>
                        <Slider images={room.images} height={200} width={300} showPreview={true} />
                    </div>
                    <div className={styles.detail}>
                        <span>
                            {handleTime(room.createdAt)} bởi {room.home.owner.fullname}
                        </span>
                        {/* <div>
                    <i className="fi fi-rr-marker"></i>
                    <p>
                        {formatName(
                            `${wardName && wardName + ', '}${
                                districtName && districtName + ', '
                            }${provinceName}`
                        )}
                    </p>
                </div>
                <div>
                    <i className="fi fi-rr-home"></i>
                    <p>
                        Tầng 4, diện tích 12m2
                    </p>
                </div>
                <div>
                    <i className="fi fi-rr-label"></i>
                    <p>
                        Tiền điện 4000đ, tiền nước 25000đ
                    </p>
                </div> */}
                        <div className={styles.detail__title}>
                            <i className="fi fi-rr-home"></i>
                            <p>
                                {room.title
                                    ? room.title
                                    : `Phòng trọ tại ${wardName} ${districtName}`}
                            </p>
                        </div>
                        <h3>{formatPrice(room.price)}/tháng</h3>
                    </div>
                </a>
            </Link>
        </li>
    );
}
