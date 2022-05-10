import { Select, Tooltip } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { getListExitPosition } from '../../lib/getPosition';

interface DefaultLocation {
    province?: number;
    district?: number;
    ward?: number;
}
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
    allProvince?: boolean;
    defaultValue?: {
        list: [any[], any[], any[]];
        value: {
            province: number;
            district: number;
            ward: number;
        };
    };
}

export default function FormLocation({
    provinceField,
    districtField,
    wardField,
    errorEvent,
    disable,
    allProvince = false,
    defaultValue,
}: FormLocationProps) {
    // const [initialValue, setInitialValue] = use
    const [value, setValue] = useState<DefaultLocation>(defaultValue?.value ?? {});
    const [provinceList, setProvinceList] = useState<any[]>(defaultValue?.list[0] ?? []);
    const [provinceActive, setProvinceActive] = useState<any>(null);
    const [districtList, setdistrictList] = useState<any[]>(defaultValue?.list[1] ?? []);
    const [districtActive, setDistrictActive] = useState<any>(null);
    const [wardList, setWardList] = useState<any[]>(defaultValue?.list[2] ?? []);

    useEffect(() => {
        if (!defaultValue) {
            if (allProvince) {
                fetch('https://provinces.open-api.vn/api/p/?depth=2')
                    .then((res) => res.json())
                    .then((data) => {
                        if (data?.length) {
                            setProvinceList(data);
                        }
                    });
            } else {
                fetch('/location/province.json')
                    .then((res) => res.json())
                    .then((data) => {
                        if (data?.length) {
                            setProvinceList(data);
                        }
                    });
            }
        }
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
        [districtList, value]
    );

    //district

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
        [wardList, value]
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
                    placeholder={'Tỉnh/TP'}
                    {...provinceField}
                    defaultValue={value.province}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && !isNaN(val)) {
                            provinceField.onChange(e);
                            setProvinceActive(e.target.value);
                        }
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
                    defaultValue={value.district}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && !isNaN(val)) {
                            districtField.onChange(e);
                            setValue({ ...value, district: val, ward: -1 });
                            setDistrictActive(e.target.value);
                        }
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
                    defaultValue={value.ward}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && !isNaN(val)) {
                            wardField.onChange(e);
                            setValue({ ...value, ward: val });
                        }
                    }}
                >
                    {renderWardList}
                </Select>
            </Tooltip>
        </>
    );
}
