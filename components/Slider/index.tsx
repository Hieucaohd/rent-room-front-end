import { useState } from 'react';
import styles from './slider.module.scss';

export interface ISliderProps {
    images: string[];
    width: number|string;
    height: number|string;
    autoplay?: boolean
}


export default function Slider({ images, width, height, autoplay }: ISliderProps) {
    const [index, setIndex] = useState<number>(0);

    const handlePrev = () => {
        if(index === 0) return;
        setIndex(index - 1);
    }

    const handleNext = () => {
        if(index + 1 === images.length) return;
        setIndex(index + 1);
    }

    return (
        <div className={styles.slideshow} style={{ width: width, height: height }}>
            <div
                className={styles.slideshow__slider}
                style={{ transform: `translate3d(${-index * 100}%, 0, 0)`, "transition": "all 0.3s linear 0s" }}
            >
                {images.map((url, index) => (
                    <div className={styles.slideshow__content} key={index}>
                        <img src={url} alt={`image-${index}`} />
                    </div>
                ))}
            </div>
            {index !== 0 && <div className={styles.slideshow__prev} onClick={handlePrev}>
                <i className="fi fi-rr-angle-left"></i>
            </div>}
            {index !== images.length - 1 && <div className={styles.slideshow__next} onClick={handleNext}>
                <i className="fi fi-rr-angle-right"></i>
            </div>}
            <div className={styles.slideshow__dots}>
                {images.map((_, i) => (
                    <div key={i} style={{backgroundColor: index === i ? '#fff' : "#ADB3B8"}}></div>
                ))}
            </div>
        </div>
    );
}