interface Position {
    latitude: number;
    longitude: number;
}

const getPosition = async (province: number) => {
    return fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
            let name = data.name.replace('Thành phố ', '').replace('Tỉnh ', '') + ', Viet Nam';
            name = name.replaceAll(' ', '%20');
            return fetch(
                `http://api.positionstack.com/v1/forward?access_key=054595b6f9daa6cdf47dcf2c55847839&query=${name}`
            )
                .then((res) => res.json())
                .then(({ data: pos }: { data: Position[] }) => pos[0]);
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
