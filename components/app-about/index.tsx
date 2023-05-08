import Link from 'next/link';
import { HTMLAttributes } from 'react';

interface AppAboutProps extends HTMLAttributes<HTMLDivElement> {}

export default function AppAbout({ style }: AppAboutProps) {
    return (
        <>
            <div className="homepage-about" style={style}>
                <div>
                    <div></div>
                    <div className="homepage-about__authority">
                        <h1>Theo dõi chúng tôi</h1>
                        <div>
                            <i className="fa-brands fa-facebook"></i>Facebook
                        </div>
                        <div>
                            <i className="fa-brands fa-instagram"></i>Instagram
                        </div>
                        <div>
                            <i className="fa-brands fa-twitter"></i>Twitter
                        </div>
                    </div>
                    <div className="homepage-about__developer">
                        <h1>Developer</h1>
                        <div>Unknown</div>
                        <div>Unknown</div>
                        <div>Unknown</div>
                        <div>Unknown</div>
                        <div>Unknown</div>
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
