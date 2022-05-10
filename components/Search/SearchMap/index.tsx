import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { formatPrice } from '../../../lib/formatPrice';
import { getPosition } from '../../../lib/getPosition';
import { Room } from '../../../lib/interface';
import useSearchStore from '../../../store/searchStore';
import Slider from '../../Slider';
import styles from './styles.module.scss';

export interface ISearchMapProps {
    roomList: Room[];
    address: {
        name: string;
        province: string;
        district: string;
        ward: string;
    };
    onShowSelect: Function;
}

const handleDuplicatePosition = (roomList: Room[]) => {
    const positionList: any = {};
    roomList.forEach(({ home }, index) => {
        let { lat, lng } = home.position;

        while (positionList[`${lat},${lng}`]) {
            lat += 0.0005;
            if (!positionList[`${lat},${lng}`]) {
                break;
            }
        }

        positionList[`${lat},${lng}`] = 1;
        home.position.lat = lat;
        home.position.lng = lng;
    });
    return roomList;
};

function ChangeView({ center, zoom, setZoom }: any) {
    if (!center) return null;
    const map = useMap();
    map.setView(center, zoom);
    const mapEvent = useMapEvents({
        zoomend: () => {
            setZoom(mapEvent.getZoom());
        },
    });
    return null;
}

export default function SearchMap({ onShowSelect, address, roomList }: ISearchMapProps) {
    const router = useRouter();
    const roomHoveredId = useSearchStore((state) => state.roomHovered);
    const [zoom, setZoom] = useState(address.district ? 14 : 12);
    const [center, setCenter] = useState<LatLngExpression>();
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (roomList.length === 0) {
            return;
        }

        const { home } = roomList.find(({ _id }) => _id === roomHoveredId) || roomList[0];
        setCenter([home.position.lat, home.position.lng]);
    }, [roomHoveredId]);

    useEffect(() => {
        const { province, district, ward } = router.query;

        if (!province) {
            setCenter([21.036238, 105.790581]);
            return;
        }

        const getDefaultCenter = async () => {
            const center = await getPosition(Number(province), Number(district), Number(ward));
            setCenter([center[1], center[0]] || [0, 0]);
        };

        if (roomList.length === 0) {
            getDefaultCenter();
        } else {
            setCenter([roomList[0].home.position.lat, roomList[0].home.position.lng]);
        }

        setZoom(address.district ? 14 : 12);
    }, [router.query]);

    return (
        <div className={styles.searchmap}>
            <div className={styles.searchmap__address} onClick={() => onShowSelect()}>
                {address.name}
                <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <MapContainer
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
            >
                <ChangeView center={center} zoom={zoom} setZoom={setZoom} />
                <TileLayer
                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_APIKEY}`}
                />
                {handleDuplicatePosition(roomList).map(({ _id, home, price, images }, index) => (
                    <Marker
                        key={index}
                        position={[home.position.lat, home.position.lng]}
                        icon={L.divIcon({
                            iconSize: [4, 4],
                            iconAnchor: [4 / 2, 4 + 9],
                            className: `mymarker ${roomHoveredId === _id && 'marker-hover'}`,
                            html: formatPrice(price),
                        })}
                    >
                        <Popup>
                            <Link href={`/room/${_id}`}>
                                <a>
                                    <Slider
                                        images={images}
                                        height={180}
                                        width={240}
                                        showPreview={true}
                                    />
                                </a>
                            </Link>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
