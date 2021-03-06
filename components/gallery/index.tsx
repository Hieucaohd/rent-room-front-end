import { Skeleton } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useResize from '@lib/use-resize';
import NextImage from '@components/nextimage/image';

interface GalleryProps {
    images: string[];
}

export function GallerySkeleton() {
    const [limit, setLimit] = useState(5);
    const [mode1] = useResize(1000);
    const [mode2] = useResize(800);
    const [mode3] = useResize(650);
    const [mode4] = useResize(500);

    useEffect(() => {
        if (mode4) {
            setLimit(1);
        } else if (mode3) {
            setLimit(2);
        } else if (mode2) {
            setLimit(3);
        } else if (mode1) {
            setLimit(4);
        } else {
            setLimit(5);
        }
    }, [mode1, mode2, mode3, mode4]);

    return (
        <div className={`gallery gallery--${5 < limit ? 5 : limit}`}>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
        </div>
    );
}

export default function Gallery({ images }: GalleryProps) {
    let len = 1;
    if (images && images.length > 0) {
        len = images.length;
    } else {
        len = 1;
    }
    const [limit, setLimit] = useState(5);
    const [mode1] = useResize(1000);
    const [mode2] = useResize(800);
    const [mode3] = useResize(650);
    const [mode4] = useResize(500);

    useEffect(() => {
        if (mode4) {
            setLimit(1);
        } else if (mode3) {
            setLimit(2);
        } else if (mode2) {
            setLimit(3);
        } else if (mode1) {
            setLimit(4);
        } else {
            setLimit(5);
        }
    }, [mode1, mode2, mode3, mode4]);

    return (
        <div
            className={`gallery gallery--${len < limit ? len : limit}`}
            style={{
                ...(!images || images.length == 0
                    ? {
                          border: '3px solid rgba(0, 0, 0, 0.3)',
                      }
                    : {}),
            }}
        >
            {images && images.length > 0 ? (
                images.map((item, index) => {
                    if (index >= limit) {
                        return null;
                    }
                    return <NextImage src={item} key={index} />;
                })
            ) : (
                <NextImage src={'/images/default.png'} key={'default'} />
            )}
        </div>
    );
}
