import { Button, Input } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { GetStaticPropsContext } from 'next';
import AppAbout from '../components/app-about';
import RoomByArea from '../components/HomePage/RoomByArea';
import { getFilterRoom } from '../lib/apollo/search';
import { Room } from '../lib/interface';

export interface IHomePageProps {
    roomsInHaNoi: Room[];
}

const Home = ({ roomsInHaNoi }: IHomePageProps) => {
    return (
        <motion.div className="main-page">
            <div className="mp-header">
                <div className="mp-header__bg">
                    <img src="/thumbnail.svg" alt="" />
                </div>
                <div className="mp-header__search">
                    <h1>WEBSITE TÌM PHÒNG TRỌ MIỄN PHÍ</h1>
                    <div>
                        <Input
                            placeholder="Khu vực của bạn"
                            border="none"
                            _focus={{
                                outline: 'none',
                            }}
                        />
                        <div>
                            <Button
                                _focus={{
                                    outline: 'none',
                                }}
                            >
                                <i className="fa-solid fa-map-location-dot"></i>
                            </Button>
                            <Button
                                _focus={{
                                    outline: 'none',
                                }}
                            >
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <RoomByArea label={'Khu vực Hà Nội'} roomList={roomsInHaNoi} />
            <AppAbout />
        </motion.div>
    );
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
    const roomsInHaNoi = await getFilterRoom(
        {
            address: {
                province: 1,
            },
        },
        1,
        4
    );
    return {
        props: {
            roomsInHaNoi: roomsInHaNoi.filterRoom.docs,
        },
    };
};

export default Home;
