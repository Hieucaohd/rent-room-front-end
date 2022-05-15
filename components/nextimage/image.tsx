import { Skeleton } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';

interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    href?: string;
}

export default function NextImage(props: NextImageProps) {
    const [loading, setLoading] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const imgProps = { ...props, href: undefined };
    return (
        <>
            <img
                {...imgProps}
                ref={imageRef}
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
