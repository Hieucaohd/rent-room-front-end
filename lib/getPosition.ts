interface Position {
    center: [number, number];
}

const getPosition = async (province: number, district?: number, ward?: number) => {
    console.log(province, district, ward);
    const mapboxApi = (name: string) => {
        return fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${name}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_APIKEY}`
        )
            .then((res) => res.json())
            .then(({ features: pos }: { features: Position[] }) => {
                return pos[1].center;
            });
    };
    return fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`)
        .then((res) => res.json())
        .then((p) => {
            let name = p.name.replace('Thành phố ', '').replace('Tỉnh ', '') + ', Viet Nam';
            if (!district) {
                name = name.replaceAll(' ', '%20');
                return mapboxApi(name);
            } else {
                return fetch(`https://provinces.open-api.vn/api/d/${district}?depth=2`)
                    .then((res) => res.json())
                    .then((d) => {
                        name = d.name.replace('Quận ', '').replace('Huyện ', '') + ', ' + name;
                        if (!ward) {
                            name = name.replaceAll(' ', '%20');
                            return mapboxApi(name);
                        } else {
                            return fetch(`https://provinces.open-api.vn/api/w/${ward}?depth=2`)
                                .then((res) => res.json())
                                .then((w) => {
                                    name =
                                        w.name.replace('Xã ', '').replace('Phường ', '') +
                                        ', ' +
                                        name;
                                    return mapboxApi(name);
                                });
                        }
                    });
            }
        });
};

const getPlace = async (lng: number, lat: number) => {
    return fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_APIKEY}`
    )
        .then((res) => res.json())
        .then((data) => data.features);
};

const getPlaceName = async (p: number, d: number, w: number) => {
    return Promise.all([
        fetch(`https://provinces.open-api.vn/api/p/${p}?depth=2`)
            .then((res) => res.json())
            .then((data) => data.name),
        fetch(`https://provinces.open-api.vn/api/d/${d}?depth=2`)
            .then((res) => res.json())
            .then((data) => data.name),
        fetch(`https://provinces.open-api.vn/api/w/${w}?depth=2`)
            .then((res) => res.json())
            .then((data) => data.name),
    ]);
};

export { getPosition, getPlace, getPlaceName };

export default {};
