import { Text } from '@chakra-ui/react';
import { useEffect, useMemo, useRef } from 'react';
import Slider from '@components/Slider';
import Link from 'next/link';

export interface HomeCardProps {
    _id: string;
    province?: any;
    district?: any;
    ward?: any;
    provinceName: string;
    districtName: string;
    wardName: string;
    liveWithOwner?: Boolean;
    electricityPrice?: number;
    waterPrice?: number;
    images: string[];
    totalRooms?: number;
    title: string;
    __typename?: any;
    afterDelete?: () => any;
}

export default function HomeCard(props: HomeCardProps) {
    const mount = useRef(false);

    useEffect(() => {
        mount.current = true;

        return () => {
            mount.current = false;
        };
    });

    const homeTitle = useMemo(() => {
        if (props.title) {
            return props.title;
        }
        return (
            props.wardName +
            ', ' +
            props.districtName.replace('Quận ', '').replace('Huyện ', '') +
            ', ' +
            props.provinceName.replace('Thành phố ', '').replace('Tỉnh ', '')
        );
    }, [props]);

    return (
        <Link href={`/home/${props._id}`}>
            <a className={`homecard`}>
                <div className="homecard__imgslider">
                    <Slider images={props.images} width="100%" height="280px" />
                </div>
                <div className="homecard-main">
                    <Text className="homecard-main__label">{homeTitle}</Text>
                    <Text>Tiền điện: {props.electricityPrice} VNĐ</Text>
                    <Text>Tiền nước: {props.waterPrice} VNĐ</Text>
                </div>
            </a>
        </Link>
    );
}
