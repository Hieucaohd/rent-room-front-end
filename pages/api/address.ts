import address from '../../lib/json/address.json';
import { Document } from 'flexsearch';
import { removeVietnameseTones } from '../../lib/removeVietnamese';

const index = new Document({
    document: {
        id: 'id',
        index: ['id'],
        store: ['province', 'district', 'ward', 'name'],
    },
});

(async () => {
    const formatProvinceName = (name: string) => {
        return name.replace('Thành phố ', '').replace('Tỉnh ', '');
    };

    const formatDistrictName = (name: string) => {
        return name
            .replace('Quận ', '')
            .replace('Huyện ', '')
            .replace('Thành phố ', 'TP.')
            .replace('Thị xã ', '');
    };

    const formatWardName = (name: string) => {
        return name.replace('Phường ', '').replace('Xã ', '');
    };

    await address.forEach(function (province) {
        province.districts.forEach((district) => {
            district.wards.forEach((ward) => {
                const addressName =
                    formatWardName(ward.name) +
                    ', ' +
                    formatDistrictName(district.name) +
                    ', ' +
                    formatProvinceName(province.name);
                index.add({
                    id: removeVietnameseTones(addressName),
                    name: addressName,
                    ward: ward.code,
                    district: district.code,
                    province: province.code,
                });
            });
        });
    });
})();

export default async function handler(req: any, res: any) {
    try {
        const { query, limit } = req.query;
        const data = await index.search(removeVietnameseTones(query), { enrich: true, limit: Number(limit) || 5 });
        res.status(200).json(data[0].result);
    } catch (e) {
        res.status(200).json([]);
    }
}
