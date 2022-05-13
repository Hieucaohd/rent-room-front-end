import { useState } from 'react';
import NextImage from '@components/nextimage/image';
import styles from './slider.module.scss';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Pagination, Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import useResize from '@lib/use-resize';

export interface ISliderProps {
    images: string[];
    width?: number | string;
    height?: number | string;
    autoplay?: boolean;
    showPreview?: boolean;
}

export default function Slider({ images, width, height, showPreview }: ISliderProps) {
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
            >
                {images.map((url, index) => (
                    <SwiperSlide key={index} className={styles.slideshow__content}>
                        <NextImage
                            style={{
                                userSelect: 'none',
                            }}
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
