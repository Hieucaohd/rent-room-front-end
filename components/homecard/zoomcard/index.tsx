import Slider from '../../Slider';

interface ZoomCardProps {
    width?: any;
    height?: any;
    data: ZoomData;
}

export interface ZoomData {
    _id: string;
    price: number;
    square: number;
    isRented: boolean;
    floor: number;
    images: string[];
    roomNumber: number;
}

export default function ZoomCard(props: ZoomCardProps) {
    const data = props.data;
    return (
        <div
            className="zoomcard"
            style={{
                ...(props.width ? { width: props.width } : {}),
                ...(props.height ? { height: props.height } : {}),
            }}
        >
            <Slider images={data?.images} height="350px" />
            <div className="zoomcard__name">
                <div>Phòng số {data?.roomNumber}</div>
                <div>{data?.price}&nbsp;VNĐ/tháng</div>
            </div>
            <div className="zoomcard__moreinfo">
                <div>
                    Diện tích {data?.square}
                    <div>
                        &nbsp;m<span>2</span>
                    </div>
                </div>
                <div>{data?.isRented ? 'đã được cho thuê' : 'chưa được cho thuê'}</div>
            </div>
        </div>
    );
}