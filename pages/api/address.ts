import address from '../../lib/json/address.json';
import { Document } from "flexsearch";

const index = new Document({
    document: {
        id: "name",
        index: ["name"],
        store: ["province", "district", "ward"]
    }
});

(async () => {
    const formatProvinceName = (name:string) => {
        return name.replace('Thành phố ', '')
                    .replace('Tỉnh ', '');
    };

    const formatDistrictName = (name:string) => {
        return name.replace('Quận ', '')
            .replace('Huyện ', '')
            .replace('Thành phố ', 'TP.')
            .replace('Thị xã ', '')
    };

    const formatWardName = (name:string) => {
        return name.replace('Phường ', '')
                    .replace('Xã ', '');
    };

    await address.forEach(function (province) {
        province.districts.forEach((district) => {
            district.wards.forEach((ward) => {
                index.add({
                    name:
                        formatWardName(ward.name) +
                        ', ' +
                        formatDistrictName(district.name) +
                        ', ' +
                        formatProvinceName(province.name),
                    ward: ward.code,
                    district: district.code,
                    province: province.code,
                });
            });
        });
    });
})();


export default async function handler(req:any, res:any) {
    try {
        const {query, limit} = req.query;
        const data = await index.search(query, {enrich: true, limit: limit || 5 });
        res.status(200).json(data[0].result);
    } catch (e) {
        res.status(200).json([]);
    }
}