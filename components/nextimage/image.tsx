import { Skeleton } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';

interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export default function NextImage(props: NextImageProps) {
    const [loading, setLoading] = useState(true);
    const imageRef = useRef<HTMLImageElement>(null);
    return (
        <>
            <img
                {...props}
                ref={imageRef}
                style={loading ? { display: 'none' } : { ...props.style }}
                onLoad={() => setLoading(false)}
            />
            {loading && (
                <Skeleton
                    width={props.width ? props.width : 'inherit'}
                    height={props.height ? props.height : 'inherit'}
                />
            )}
        </>
    );
}
