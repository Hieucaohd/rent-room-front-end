export default function GoogleMap(props: any) {
    console.log(props.query);
    return (
        <>
            <iframe
                style={{
                    width: '100%',
                    height: '100%',
                }}
                src={`https://maps.google.com/maps?width=600&height=400&hl=en&q=${props.query}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
                // src="https://maps.google.com/maps?q=21.03734728149971, 105.78231547254711&hl=es&z=14&amp;output=embed"
            />
        </>
    );
}
