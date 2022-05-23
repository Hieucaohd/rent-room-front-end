export interface RoomData {
    __typename: string;
    _id: string;
    home: any;
    price: number;
    square: number;
    isRented: Boolean;
    floor: number;
    images: [string];
    description: string;
    amenities: {
        title: string;
    }[];
    roomNumber: string;
    createdAt: string;
    title: string;
}

export interface Paginator {
    __typename: string;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    page: number;
    totalDocs: number;
    totalPages: number;
    prevPage: number;
    nextPage: number;
}

export interface ListZoomData {
    docs: RoomData[];
    paginator: Paginator;
}
