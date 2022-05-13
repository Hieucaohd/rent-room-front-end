import { useMediaQuery } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { timeAgo } from '@lib/date';
import { formatPrice } from '@lib/formatPrice';
import { formatAddressName } from '@lib/getPosition';
import { Room } from '@lib/interface';
import useSearchStore from '@store/searchStore';
import styles from './styles.module.scss';

const Slider = dynamic(() => import('../../Slider'), { ssr: false });

export interface ISearchRoomProps {
    room: Room;
    index: number;
    isSearchPage?: boolean;
}

export default function SearchRoom({ room, index, isSearchPage }: ISearchRoomProps) {
    const { wardName, districtName, provinceName, waterPrice, electricityPrice } = room.home;
    const setRoomHovered = useSearchStore((state) => state.setRoomHovered);
    const [isMobile] = useMediaQuery('(max-width: 600px)');
    const address =
        wardName +
        ', ' +
        districtName +
        `${!isSearchPage ? `, ${formatAddressName(provinceName)}` : ''}`;
    return (
        <li>
            <Link href={`/room/${room._id}`}>
                <a
                    className={styles.item}
                    onMouseOver={isSearchPage ? () => setRoomHovered(room._id) : undefined}
                >
                    <div className={styles.slider}>
                        <Slider
                            images={room.images}
                            height={isMobile ? 240 : 200}
                            width={isMobile ? '100%' : 300}
                            showPreview={true}
                        />
                    </div>
                    <div className={styles.detail}>
                        <span>
                            {timeAgo(room.createdAt)} bởi {room.home.owner.fullname}
                        </span>
                        <div className={styles.detail__title}>
                            <i className="fi fi-rr-home"></i>
                            <h4>
                                {room.title
                                    ? room.title
                                    : `${!isSearchPage && isMobile ? 'P. ' : 'Phòng'} ${
                                          room.roomNumber ? room.roomNumber : 'trọ'
                                      } gần ${isMobile ? formatAddressName(address) : address}`}
                            </h4>
                        </div>
                        <div className={styles.line}></div>
                        <div className={styles.detail__description}>
                            {waterPrice && `Giá nước ${formatPrice(waterPrice)}`}{' '}
                            {waterPrice && electricityPrice && '∙'}{' '}
                            {electricityPrice && `Giá điện ${formatPrice(electricityPrice)}`}{' '}
                            {electricityPrice && room.square && electricityPrice && '∙'}{' '}
                            {room.square && `Diện tích ${room.square}m²`}{' '}
                            {room.floor && room.square && electricityPrice && '∙'}{' '}
                            {room.floor && `Tầng ${room.floor}`}{' '}
                        </div>
                        <h3>{formatPrice(room.price)}/tháng</h3>
                    </div>
                </a>
            </Link>
        </li>
    );
}
