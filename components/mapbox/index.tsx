import { Box, Button, CloseButton, Skeleton, Spinner } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPlace, getPosition } from '@lib/getPosition';
import mapboxgl from '@lib/mapbox';
import styles from './mapbox.module.scss';

export interface MapField {
    place_name: string;
    center: [number, number];
}

export interface MapSourcePlace {
    type: 'Feature';
    properties: {
        description: string;
        icon: string;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
}

interface MapboxProps {
    province?: number;
    district?: number;
    ward?: number;
    center?: number[];
    delay?: number;
    onChange?: (data: MapField | null) => any;
    hasMarker?: boolean;
    source?: any[];
    choosePlace?: boolean;
    markerIcon?: HTMLElement;
}

interface Place {
    loading: boolean;
    show: boolean;
    data: any[];
}

export default function MapBox({
    province,
    district,
    ward,
    center,
    delay,
    onChange,
    hasMarker = true,
    choosePlace = true,
    markerIcon,
}: MapboxProps) {
    const mount = useRef(false);
    const mapbox = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);

    const setMapData = onChange ? onChange : (data: any) => {};
    const [choosingPlace, setChoosingPlace] = useState<[number, number] | null>(null);
    const [provinceData, setProvinceData] = useState<[number, number] | null>(null);
    const [loadingProvince, setLoadingProvince] = useState(true);

    const [places, setPlaces] = useState<Place>({
        loading: false,
        show: false,
        data: [],
    });
    const [isDelay, setIsDelay] = useState(delay ? true : false);

    useEffect(() => {
        mount.current = true;
        return () => {
            mount.current = false;
        };
    }, []);

    useEffect(() => {
        if (province) {
            getPosition(province, district, ward).then((pos) => {
                if (!mount.current) {
                    return;
                }
                console.log(pos);
                setProvinceData([...pos]);
                setLoadingProvince(false);
            });
        } else {
            setLoadingProvince(false);
        }
    }, []);

    useEffect(() => {
        if (setMapData) {
            if (places.data.length > 0 && choosingPlace) {
                setMapData({
                    place_name: 'Gần ' + places.data[0].place_name,
                    center: choosingPlace,
                });
            } else if (places.data.length > 0) {
                setMapData({
                    place_name: places.data[0].place_name,
                    center: places.data[0].center,
                });
            } else {
                setMapData(null);
            }
        }
    }, [places.data, choosingPlace]);

    useEffect(() => {
        if (delay) {
            setTimeout(() => {
                if (mount.current) {
                    console.log('remove delay');
                    setIsDelay(false);
                }
            }, delay);
        } else {
            setIsDelay(false);
        }
    }, []);

    const addMap = useCallback(
        (map: any, mark: { current: mapboxgl.Marker | null }) => {
            map.addControl(new mapboxgl.NavigationControl());
            const mapboxClick = (e: any) => {
                if (!choosePlace) {
                    return;
                }
                setChoosingPlace([e.lngLat.lng, e.lngLat.lat]);
                if (mark.current) {
                    mark.current.remove();
                }
                if (markerIcon) {
                    mark.current = new mapboxgl.Marker(markerIcon)
                        .setLngLat([e.lngLat.lng, e.lngLat.lat])
                        .addTo(map);
                } else {
                    mark.current = new mapboxgl.Marker()
                        .setLngLat([e.lngLat.lng, e.lngLat.lat])
                        .addTo(map);
                }
                setPlaces({
                    ...places,
                    loading: true,
                    show: true,
                });
                getPlace(e.lngLat.lng, e.lngLat.lat).then((data) => {
                    setPlaces({
                        data: data,
                        loading: false,
                        show: true,
                    });
                });
            };

            map.on('click', mapboxClick);

            const mapboxZoom = (e: any) => {
                console.log(e.target.style.z);
            };

            map.on('zoomend', mapboxZoom);

            return () => {
                map.off('click', mapboxClick);
                map.off('zoomend', mapboxZoom);
                if (mapbox.current) {
                    mapbox.current.remove();
                }
            };
        },
        [center]
    );

    useEffect(() => {
        if (!isDelay && !loadingProvince) {
            if (center && !isNaN(center[0]) && !isNaN(center[1])) {
                mapbox.current = new mapboxgl.Map({
                    container: 'mapbox', // container id
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [center[0], center[1]], // starting position
                    zoom: 12, // starting zoom
                });
                if (hasMarker) {
                    if (markerIcon) {
                        marker.current = new mapboxgl.Marker(markerIcon)
                            .setLngLat([center[0], center[1]])
                            .addTo(mapbox.current);
                    } else {
                        marker.current = new mapboxgl.Marker()
                            .setLngLat([center[0], center[1]])
                            .addTo(mapbox.current);
                    }
                }
            } else if (provinceData) {
                mapbox.current = new mapboxgl.Map({
                    container: 'mapbox', // container id
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [provinceData[0], provinceData[1]], // starting position
                    zoom: 12, // starting zoom
                });
                marker.current = null;
            } else {
                mapbox.current = new mapboxgl.Map({
                    container: 'mapbox', // container id
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [105.78060343399011, 21.036588327773586], // starting position
                    zoom: 12, // starting zoom
                });
                marker.current = null;
            }
            return addMap(mapbox.current, marker);
        }
    }, [provinceData, isDelay, loadingProvince]);

    if (isDelay || loadingProvince) {
        return <Skeleton height="var(--addhome-mapheight)"></Skeleton>;
    }

    return (
        <>
            <div className={styles.mapbox}>
                <div id="mapbox"></div>
                <pre id="info"></pre>
                <AnimatePresence>
                    {places.show && (
                        <motion.div
                            initial={{
                                y: '100%',
                            }}
                            animate={{
                                y: '0',
                            }}
                            exit={{
                                y: '100%',
                            }}
                            transition={{
                                duration: 0.3,
                            }}
                            className={styles['mapbox__alert']}
                        >
                            <CloseButton
                                width="35px"
                                height="35px"
                                onClick={() => setPlaces({ data: [], loading: false, show: false })}
                                _focus={{ boxShadow: 'none' }}
                            />
                            {!places.loading &&
                                places.data.map((item, index) => (
                                    <Button
                                        onClick={() => {
                                            console.log(item);
                                            setChoosingPlace(null);
                                            setPlaces({
                                                ...places,
                                                data: [item],
                                            });
                                        }}
                                        _focus={{ boxShadow: 'none' }}
                                        leftIcon={<i className="fa-solid fa-location-dot"></i>}
                                        variant="ghost"
                                        key={index}
                                    >
                                        {item.place_name}
                                    </Button>
                                ))}
                            {places.loading && (
                                <Box
                                    height="100px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Spinner />
                                </Box>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
