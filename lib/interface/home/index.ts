import { ListZoomData } from './room';

export interface HomeData {
    _id: string;
    owner: {
        _id: string;
        fullname: string;
        avatar: string;
        numberPhone: string;
    };
    provinceName: string;
    districtName: string;
    wardName: string;
    province: number;
    district: number;
    ward: number;
    liveWithOwner: boolean;
    electricityPrice: number;
    waterPrice: number;
    images: string[];
    totalRooms: number;
    internetPrice: number;
    cleaningPrice: number;
    description: string;
    position: {
        lng: number;
        lat: number;
    };
    listRooms: ListZoomData;
    title?: string;
    detailAddress?: string;
}

export * from './room';
