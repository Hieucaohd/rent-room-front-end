import {
    Box,
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Skeleton,
    SkeletonText,
    Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export interface HomeCardProps {
    _id?: string;
    province?: any;
    district?: any;
    ward?: any;
    liveWithOwner?: Boolean;
    electricityPrice?: number;
    waterPrice?: number;
    images: string[];
    totalRooms?: number;
    __typename?: any;
}

export default function HomeCard(props: HomeCardProps) {
    const [nameProvince, setNameProvince] = useState('');
    const [nameDistrict, setNameDistrict] = useState('');
    const [nameWard, setNameWard] = useState('');
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        if (props.province) {
            fetch(`https://provinces.open-api.vn/api/p/${props.province}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.name) {
                        setNameProvince(data.name.replace('Thành phố ', '').replace('Tỉnh ', ''));
                    }
                });
        }
    }, []);

    useEffect(() => {
        if (props.district) {
            fetch(`https://provinces.open-api.vn/api/d/${props.district}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.name) {
                        setNameDistrict(data.name.replace('Quận ', '').replace('Huyện ', ''));
                    }
                });
        }
    }, []);

    useEffect(() => {
        if (props.ward) {
            fetch(`https://provinces.open-api.vn/api/w/${props.ward}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.name) {
                        setNameWard(data.name);
                    }
                });
        }
    }, []);

    useEffect(() => {
        if (nameProvince != '' && nameDistrict != '' && nameWard != '') {
            setLoading(false);
        }
    }, [nameProvince, nameDistrict, nameWard]);

    return (
        <>
            <div className={`homecard${imageLoading || loading ? ' loading' : ''}`}>
                <div className="homecard__imgslider">
                    <img
                        style={{ objectFit: 'cover' }}
                        onLoad={() => setImageLoading(false)}
                        src={props.images[0]}
                        alt=""
                    />
                </div>
                <div className="homecard-main">
                    <Text className="homecard-main__label">
                        {loading
                            ? 'Loading...'
                            : nameWard + ', ' + nameDistrict + ', ' + nameProvince}
                    </Text>
                    <Text>Tiền điện: {props.electricityPrice} VNĐ</Text>
                    <Text>Tiền nước: {props.waterPrice} VNĐ</Text>
                    <div className="homecard-main__action">
                        <Menu placement="bottom-end">
                            <MenuButton>
                                <i className="fi fi-bs-menu-dots-vertical"></i>
                            </MenuButton>
                            <MenuList>
                                <MenuItem>Xóa trọ</MenuItem>
                            </MenuList>
                        </Menu>
                    </div>
                </div>
            </div>
            {(imageLoading || loading) && (
                <Box>
                    <Skeleton borderRadius={'10px'} height="270px"></Skeleton>
                    <SkeletonText mt="4" noOfLines={3} spacing="4" />
                </Box>
            )}
        </>
    );
}
