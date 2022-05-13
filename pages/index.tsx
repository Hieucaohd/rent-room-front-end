import { motion } from 'framer-motion';
import Link from 'next/link';
import AppAbout from '@components/app-about';
import SearchBox from '@components/SeachBox';
import SearchRoom from '@components/Search/SearchList/SearchRoom';
import { getFilterRoom } from '@lib/apollo/search';
import { Room } from '@lib/interface';
export interface IHomePageProps {
    lastestRooms: Room[];
}

const Home = ({ lastestRooms }: IHomePageProps) => {
    return (
        <motion.div>
            <div className="main-page">
                <section className="mp-header">
                    <div className="mp-header__bg">
                        <img src="/thumbnail.svg" alt="" />
                    </div>
                    <div className="mp-header__search">
                        <h1>WEBSITE TÌM PHÒNG TRỌ MIỄN PHÍ</h1>
                        <SearchBox />
                    </div>
                </section>
                <section className="homepage-address">
                    <Link href="/search?province=1">
                        <a>
                            <div>
                                <img src="/images/ha_noi.jpg" alt="Hà Nội" />
                            </div>
                            <h5>Phòng trọ Hà Nội</h5>
                        </a>
                    </Link>
                    <Link href="/search?province=79">
                        <a>
                            <div>
                                <img src="/images/ho_chi_minh.webp" alt="Hồ Chí Minh" />
                            </div>
                            <h5>Phòng trọ Hồ Chí Minh</h5>
                        </a>
                    </Link>
                    <Link href="/search?province=48">
                        <a>
                            <div>
                                <img src="/images/da_nang.jpg" alt="Đà Nẵng" />
                            </div>
                            <h5>Phòng trọ Đà Nẵng</h5>
                        </a>
                    </Link>
                </section>
                <section className="homepage-topic">
                    <section className="homepage-posts">
                        <h4>Phòng trọ mới nhất</h4>
                        <ul>
                            {lastestRooms.map((room, index) => (
                                <SearchRoom room={room} index={1} key={index} />
                            ))}
                        </ul>
                    </section>
                    <aside className="homepage-link">
                        <section>
                            <h4>Xem theo giá</h4>
                            <section>
                                <Link href="/search?maxPrice=1000000">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Dưới 1 triệu
                                    </a>
                                </Link>
                                <Link href="/search?minPrice=1000000&maxPrice=1000000">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 1 - 2 triệu
                                    </a>
                                </Link>
                                <Link href="/search?minPrice=2000000&maxPrice=3000000">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 2 - 3 triệu
                                    </a>
                                </Link>
                                <Link href="/search?minPrice=3000000&maxPrice=5000000">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 3 - 5 triệu
                                    </a>
                                </Link>
                                <Link href="/search?minPrice=5000000&maxPrice=7000000">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 5 - 7 triệu
                                    </a>
                                </Link>
                                <Link href="/search?minPrice=7000000&maxPrice=10000000">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 7 - 10 triệu
                                    </a>
                                </Link>
                                <Link href="/search?minPrice=10000000&maxPrice=150000000">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 10 - 15 triệu
                                    </a>
                                </Link>
                                <Link href="/search?minPrice=15000000">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Trên 15 triệu
                                    </a>
                                </Link>
                            </section>
                        </section>
                        <section>
                            <h4>Xem theo diện tích</h4>
                            <section>
                                <Link href="/search?maxSquare=20">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Dưới 20m²
                                    </a>
                                </Link>
                                <Link href="/search?minSquare=20&maxSquare=30">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 20 - 30m²
                                    </a>
                                </Link>
                                <Link href="/search?minSquare=30&maxSquare=50">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 30 - 50m²
                                    </a>
                                </Link>
                                <Link href="/search?minSquare=50&maxSquare=70">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 50 - 70m²
                                    </a>
                                </Link>
                                <Link href="/search?minSquare=70&maxSquare=100">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Từ 70 - 100m²
                                    </a>
                                </Link>
                                <Link href="/search?minSquare=100">
                                    <a>
                                        <i className="fa-solid fa-angle-right"></i> Trên 100m²
                                    </a>
                                </Link>
                            </section>
                        </section>
                    </aside>
                </section>
            </div>
            <AppAbout />
        </motion.div>
    );
};

export const getServerSideProps = async () => {
    try {
        const lastestRooms = await getFilterRoom({}, 1, 8);
        return {
            props: {
                lastestRooms: lastestRooms.filterRoom.docs,
            },
        };
    } catch (e) {
        return {
            props: {
                lastestRooms: [],
            },
        };
    }
};

export default Home;
