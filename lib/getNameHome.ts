import { HomeData } from '../pages/home/[homeid]';

export default function getTitleHome(homeData: HomeData) {
    if (homeData.title) {
        return {
            value: homeData.title,
            isTitle: true,
        };
    }
    const value =
        homeData.wardName +
        ', ' +
        homeData.districtName.replace('Quận ', '').replace('Huyện ', '') +
        ', ' +
        homeData.provinceName.replace('Thành phố ', '').replace('Tỉnh ', '');
    return {
        value,
        isTitle: false,
    };
}
