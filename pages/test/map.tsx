import MapBox from '../../components/mapbox';

export default function map(props: any) {
    return (
        <>
            <div
                style={{
                    height: 'calc(100vh - var(--app-navbar-height))',
                }}
            >
                <MapBox />
            </div>
        </>
    );
}
