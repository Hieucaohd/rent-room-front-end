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
import useClassName from '@lib/useClassName';

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
    const [mobilemode] = useResize();
    const [className] = useClassName(styles);

    return (
        <div
            {...className('slideshow')}
            style={{
                ...(width ? { width } : {}),
                ...(height ? { height } : {}),
                ...(!images || images.length == 0
                    ? {
                          border: '3px solid rgba(0, 0, 0, 0.3)',
                      }
                    : {}),
            }}
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
                {images && images.length > 0 ? (
                    images.map((url, index) => (
                        <SwiperSlide key={index} {...className('slideshow__content')}>
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
                    ))
                ) : (
                    <SwiperSlide
                        key={'image-${0}'}
                        {...className('slideshow__content slideshow__content--empty')}
                    >
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
                            src={'/images/default.png'}
                            alt={`image-${0}`}
                            width={width}
                            height={height}
                        />
                    </SwiperSlide>
                )}
            </Swiper>
        </div>
    );
}
