import Link from 'next/link';

export default function AppAbout() {
    return (
        <>
            <div className="homepage-about">
                <div>
                    <div></div>
                    <div className="homepage-about__authority">
                        <h1>Theo dõi chúng tôi</h1>
                        <div>
                            <i className="fi fi-brands-facebook"></i>Facebook
                        </div>
                        <div>
                            <i className="fi fi-brands-instagram"></i>Instagram
                        </div>
                        <div>
                            <i className="fi fi-brands-twitter"></i>Twitter
                        </div>
                    </div>
                    <div className="homepage-about__developer">
                        <h1>Developer</h1>
                        <div>Cao Trung Hiếu</div>
                        <div>Nguyễn Quốc Đại</div>
                        <div>Nguyễn Khắc Hiệp</div>
                        <div>Bùi Tuấn Anh</div>
                        <div>Nguyễn Thế Anh</div>
                    </div>
                </div>
                <hr />
                <div className="homepage-about__footer">
                    <div>
                        <Link href="/">
                            <a className="app-logo">
                                <span>Rent </span> <span>Room</span>
                            </a>
                        </Link>
                    </div>
                    <div>
                        © 2022 Website hỗ trợ tìm kiếm phòng trọ, giúp bạn tìm kiếm sự tiện nghi
                        ngay tại nhà
                    </div>
                </div>
            </div>
        </>
    );
}
