import { Skeleton } from '@chakra-ui/react';
import { motion, useDomEvent } from 'framer-motion';
import React, { useRef, useState } from 'react';

interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const transition = {
    type: 'spring',
    damping: 25,
    stiffness: 120,
};

export default function MotionImage(props: NextImageProps) {
    const [loading, setLoading] = useState(true);
    const imageProps = { ...props, preview: undefined };

    const [isOpen, setOpen] = useState(false);

    useDomEvent(useRef(window), 'scroll', () => isOpen && setOpen(false));

    return (
        <>
            <motion.div
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={transition}
                className="shade"
                onClick={() => setOpen(false)}
            />
            <img
                {...imageProps}
                style={loading ? { display: 'none' } : { ...props.style }}
                onLoad={() => setLoading(false)}
            />
            {loading && (
                <Skeleton
                    width={props.width ? props.width : ''}
                    height={props.height ? props.height : ''}
                />
            )}
        </>
    );
}
