import { Select, Tooltip } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormLocationProps {
    provinceField: UseFormRegisterReturn;
    districtField: UseFormRegisterReturn;
    wardField: UseFormRegisterReturn;
    errorEvent?: {
        province: boolean;
        district: boolean;
        ward: boolean;
    };
    disable?: boolean;
}

export default function FormLocation({
    provinceField,
    districtField,
    wardField,
    errorEvent,
    disable,
}: FormLocationProps) {
    const [provinceList, setProvinceList] = useState<any[]>([]);
    const [provinceActive, setProvinceActive] = useState<any>(null);
    useEffect(() => {
        fetch('/location/province.json')
            .then((res) => res.json())
            .then((data) => {
                if (data?.length) {
                    setProvinceList(data);
                }
            });
    }, []);
    const renderProvinceList = useMemo(
        () =>
            provinceList.map((item, index) => {
                item.name = item.name.replace('Thành phố ', '').replace('Tỉnh ', '');
                return (
                    <option key={index} value={item.code}>
                        {item.name}
                    </option>
                );
            }),
        [provinceList]
    );

    //district
    const [districtList, setdistrictList] = useState<any[]>([]);
    const [districtActive, setDistrictActive] = useState<any>(null);
    useEffect(() => {
        if (provinceActive) {
            fetch(`https://provinces.open-api.vn/api/p/${provinceActive}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.districts) {
                        setdistrictList(data.districts);
                    }
                });
        }
    }, [provinceActive]);
    const renderDistrictList = useMemo(
        () =>
            districtList.map((item, index) => {
                item.name = item.name.replace('Quận ', '').replace('Huyện ', '');
                return (
                    <option key={index} value={item.code}>
                        {item.name}
                    </option>
                );
            }),
        [districtList]
    );

    //district
    const [wardList, setWardList] = useState<any[]>([]);
    useEffect(() => {
        if (districtActive) {
            fetch(`https://provinces.open-api.vn/api/d/${districtActive}?depth=2`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.wards) {
                        setWardList(data.wards);
                    }
                });
        }
    }, [districtActive]);
    const renderWardList = useMemo(
        () =>
            wardList.map((item, index) => {
                item.name = item.name.replace('Xã ', '').replace('Phường ', '');
                return (
                    <option key={index} value={item.code}>
                        {item.name}
                    </option>
                );
            }),
        [wardList]
    );
    return (
        <>
            <Tooltip
                label="Tỉnh/TP không hợp lệ"
                borderRadius="3px"
                placement="bottom"
                isDisabled={errorEvent ? !errorEvent.province : true && !disable}
                bg="red"
                hasArrow
            >
                <Select
                    height="50px"
                    borderWidth="3px"
                    cursor="pointer"
                    _focus={{
                        outline: 'none',
                        borderColor: '#80befc',
                    }}
                    isDisabled={disable}
                    borderColor={
                        errorEvent && !disable
                            ? errorEvent.province
                                ? 'red'
                                : 'inherit'
                            : 'inherit'
                    }
                    placeholder="Tỉnh/TP"
                    {...provinceField}
                    onChange={(e) => {
                        provinceField.onChange(e);
                        setProvinceActive(e.target.value);
                    }}
                >
                    {renderProvinceList}
                </Select>
            </Tooltip>
            <Tooltip
                label="Quận/Huyện không hợp lệ"
                borderRadius="3px"
                placement="bottom"
                isDisabled={!disable && errorEvent ? !errorEvent.district : true}
                bg="red"
                hasArrow
            >
                <Select
                    height="50px"
                    borderWidth="3px"
                    cursor="pointer"
                    _focus={{
                        outline: 'none',
                        borderColor: '#80befc',
                    }}
                    isDisabled={disable}
                    borderColor={
                        errorEvent && !disable
                            ? errorEvent.district
                                ? 'red'
                                : 'inherit'
                            : 'inherit'
                    }
                    placeholder="Quận/Huyện"
                    {...districtField}
                    onChange={(e) => {
                        districtField.onChange(e);
                        setDistrictActive(e.target.value);
                    }}
                >
                    {renderDistrictList}
                </Select>
            </Tooltip>
            <Tooltip
                label="Xã/Phường không hợp lệ"
                borderRadius="3px"
                placement="bottom"
                isDisabled={!disable && errorEvent ? !errorEvent.ward : true}
                bg="red"
                hasArrow
            >
                <Select
                    height="50px"
                    borderWidth="3px"
                    cursor="pointer"
                    _focus={{
                        outline: 'none',
                        borderColor: '#80befc',
                    }}
                    isDisabled={disable}
                    borderColor={
                        errorEvent && !disable ? (errorEvent.ward ? 'red' : 'inherit') : 'inherit'
                    }
                    placeholder="Xã/Phường"
                    {...wardField}
                    onChange={(e) => {
                        wardField.onChange(e);
                    }}
                >
                    {renderWardList}
                </Select>
            </Tooltip>
        </>
    );
}
