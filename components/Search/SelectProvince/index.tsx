import { Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { getDistrictList, getProvinceList, getWardList } from '../../../lib/getPosition';
import styles from './styles.module.scss';

export interface ISelectProvinceProps {
    disableSelect: () => void;
}

export default function SelectProvince({ disableSelect }: ISelectProvinceProps) {
    const [provinceList, setProvinceList] = useState([]);
    const [districtList, setDistrictList] = useState([]);
    const [wardList, setWardList] = useState([]);
    const router = useRouter();
    const { province, district, ward } = router.query;

    useEffect(() => {
        const getProvinces = async () => {
            const list = await getProvinceList();
            setProvinceList(list);
        };

        getProvinces();
    }, []);

    useEffect(() => {
        const getDefaultAddress = async () => {
            await Promise.all([
                province && handleChangeProvince(province),
                district && handleChangeDistrict(district),
            ]);
        };
        getDefaultAddress();
    }, []);

    const handleChangeProvince = async (code: any) => {
        const { districts } = await getDistrictList(code);
        setDistrictList(districts);
    };

    const handleChangeDistrict = async (code: any) => {
        const { wards } = await getWardList(code);
        setWardList(wards);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        disableSelect();
        router.push(`search?${queryString.stringify(data)}`);
    };

    return (
        <div className={styles.select__province}>
            <div className={styles.overlay} onClick={disableSelect} />
            <form onSubmit={handleSubmit}>
                <Select
                    name="province"
                    placeholder="Tỉnh/Thành phố"
                    width={60}
                    margin={1}
                    onChange={(e) => handleChangeProvince(e.target.value)}
                >
                    {provinceList?.map(({ name, code }, index) => (
                        <option key={index} value={code} selected={province == code}>
                            {name}
                        </option>
                    ))}
                </Select>
                <Select
                    name="district"
                    placeholder="Quận/Huyện"
                    width={60}
                    margin={1}
                    onChange={(e) => handleChangeDistrict(e.target.value)}
                >
                    {districtList?.map(({ name, code }, index) => (
                        <option key={index} value={code} selected={district == code}>
                            {name}
                        </option>
                    ))}
                </Select>
                <Select name="ward" placeholder="Phường Xã" width={60} margin={1}>
                    {wardList?.map(({ name, code }, index) => (
                        <option key={index} value={code} selected={ward == code}>
                            {name}
                        </option>
                    ))}
                </Select>
                <button type="submit">
                    <i className="fi fi-rr-search"></i>
                </button>
            </form>
        </div>
    );
}
