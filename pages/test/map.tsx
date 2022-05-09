import { AspectRatio } from '@chakra-ui/react';
import MapBox from '../../components/mapbox';

export default function map(props: any) {
    return (
        <>
            <div
                style={{
                    height: 'calc(100vh - var(--app-navbar-height))',
                }}
            >
                <iframe
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=21.03734728149971,105.78231547254711 &amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                    // src="https://maps.google.com/maps?q=21.03734728149971, 105.78231547254711&hl=es&z=14&amp;output=embed"
                />
            </div>
        </>
    );
}
