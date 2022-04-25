import { Button, Input } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { GetServerSidePropsContext } from 'next';

export interface IHomePageProps {
    user: any;
}

const Home = ({ user }: IHomePageProps) => {
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
                                <i className="fi fi-ss-map-marker"></i>
                            </Button>
                            <Button
                                _focus={{
                                    outline: 'none',
                                }}
                            >
                                <i className="fi fi-rr-search"></i>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const getServerSideProps = (context: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default Home;
