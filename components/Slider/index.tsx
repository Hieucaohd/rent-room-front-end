import { useState } from 'react';
import NextImage from '@components/nextimage/image';
import styles from './slider.module.scss';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Pagination, Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import useResize from '@lib/use-resize';
import { useRouter } from 'next/router';

export interface ISliderProps {
    images: string[];
    width?: number | string;
    height?: number | string;
    autoplay?: boolean;
    showPreview?: boolean;
    href?: string;
}

export default function Slider({ images, width, height, href }: ISliderProps) {
    const router = useRouter();
    const [index, setIndex] = useState<number>(0);
    const [mobilemode] = useResize();

    return (
        <div
            className={styles.slideshow}
            style={{ ...(width ? { width } : {}), ...(height ? { height } : {}) }}
        >
            <Swiper
                pagination={{
                    clickable: !mobilemode,
                    dynamicBullets: true,
                }}
                navigation={!mobilemode}
                modules={!mobilemode ? [Pagination, Navigation] : [Pagination]}
                className={styles.slideshow__slider}
                onClick={() => {
                    href && router.push(href);
                }}
            >
                {images.map((url, index) => (
                    <SwiperSlide key={index} className={styles.slideshow__content}>
                        <NextImage
                            style={
                                href
                                    ? {
                                          userSelect: 'none',
                                          cursor: 'pointer',
                                      }
                                    : {
                                          userSelect: 'none',
                                      }
                            }
                            src={url}
                            alt={`image-${index}`}
                            width={width}
                            height={height}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
