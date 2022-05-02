import { Button, Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

export interface IFilterBarProps {}

enum DropDown {
    PRICE,
    SQUARE,
    NONE,
}

export default function FilterBar(props: IFilterBarProps) {
    const [dropDown, setDropDown] = useState<DropDown>(DropDown.NONE);
    const router = useRouter();
    const {
        minPrice,
        maxPrice,
        arrangePrice,
        createdAt,
        minWaterPrice,
        maxWaterPrice,
        arrangeWaterPrice,
        minElectricityPrice,
        maxElectricityPrice,
        arrangeElectricityPrice,
        minSquare,
        maxSquare,
        arrangeSquare,
    } = router.query;

    const isPriceFilter = minPrice || maxPrice || arrangePrice;
    const isWaterFilter = minWaterPrice || maxWaterPrice || arrangeWaterPrice;
    const isElectricityFilter =
        minElectricityPrice || maxElectricityPrice || arrangeElectricityPrice;
    const isFilterSquare = minSquare || maxSquare || arrangeSquare;

    const handleSubmitFilter = (e: any) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        router.push({
            pathname: 'search',
            query: {
                ...router.query,
                ...handleFilter(data, router.query),
            },
        });
        setDropDown(DropDown.NONE);
    };

    const handleSubmitCreatedAt = (createdAt:string) => {
        router.push({
            pathname: 'search',
            query: {
                ...router.query,
                createdAt
            },
        });
    }

    return (
        <div className={styles.filterbar}>
            <div className={styles.item}>
                <div
                    className={clsx(
                        styles.item__label,
                        (isPriceFilter || isElectricityFilter || isWaterFilter) && styles.choose
                    )}
                    onClick={() =>
                        setDropDown(dropDown === DropDown.PRICE ? DropDown.NONE : DropDown.PRICE)
                    }
                >
                    Giá{' '}
                    <i
                        className={`fa-solid fa-angle-${
                            dropDown === DropDown.PRICE ? 'up' : 'down'
                        }`}
                    ></i>
                </div>
                {dropDown === DropDown.PRICE && (
                    <form className={styles.dropdown__price} onSubmit={handleSubmitFilter}>
                        <div>
                            <span>Tiền trọ</span>
                            <div>
                                <input
                                    type="number"
                                    name="minPrice"
                                    defaultValue={minPrice && Number(minPrice)}
                                    placeholder="tối thiểu"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    defaultValue={maxPrice && Number(maxPrice)}
                                    placeholder="tối đa"
                                />
                                <Select name="arrangePrice" placeholder="Sắp xếp">
                                    <option value="ASC" selected={arrangePrice === 'ASC'}>
                                        Tăng dần
                                    </option>
                                    <option value="DESC" selected={arrangePrice === 'DESC'}>
                                        Giảm dần
                                    </option>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <span>Tiền điện</span>
                            <div>
                                <input
                                    type="number"
                                    placeholder="tối thiểu"
                                    name="minElectricityPrice"
                                    defaultValue={
                                        minElectricityPrice && Number(minElectricityPrice)
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="tối đa"
                                    name="maxElectricityPrice"
                                    defaultValue={
                                        maxElectricityPrice && Number(maxElectricityPrice)
                                    }
                                />
                                <Select placeholder="Sắp xếp" name="arrangeElectricityPrice">
                                    <option
                                        value="ASC"
                                        selected={arrangeElectricityPrice === 'ASC'}
                                    >
                                        Tăng dần
                                    </option>
                                    <option
                                        value="DESC"
                                        selected={arrangeElectricityPrice === 'DESC'}
                                    >
                                        Giảm dần
                                    </option>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <span>Tiền nước</span>
                            <div>
                                <input
                                    type="number"
                                    placeholder="tối thiểu"
                                    name="minWaterPrice"
                                    defaultValue={minWaterPrice && Number(minWaterPrice)}
                                />
                                <input
                                    type="number"
                                    placeholder="tối đa"
                                    name="maxWaterPrice"
                                    defaultValue={maxWaterPrice && Number(maxWaterPrice)}
                                />
                                <Select placeholder="Sắp xếp" name="arrangeWaterPrice">
                                    <option value="ASC" selected={arrangeWaterPrice === 'ASC'}>
                                        Tăng dần
                                    </option>
                                    <option value="DESC" selected={arrangeWaterPrice === 'DESC'}>
                                        Giảm dần
                                    </option>
                                </Select>
                            </div>
                        </div>
                        <Button type="submit" colorScheme="blue">
                            Lưu
                        </Button>
                    </form>
                )}
            </div>
            <div className={styles.item}>
                <div
                    className={clsx(styles.item__label, isFilterSquare && styles.choose)}
                    onClick={() =>
                        setDropDown(dropDown === DropDown.SQUARE ? DropDown.NONE : DropDown.SQUARE)
                    }
                >
                    Diện tích{' '}
                    <i
                        className={`fa-solid fa-angle-${
                            dropDown === DropDown.SQUARE ? 'up' : 'down'
                        }`}
                    ></i>
                </div>
                {dropDown === DropDown.SQUARE && (
                    <form className={styles.dropdown__square} onSubmit={handleSubmitFilter}>
                        <div>
                            <span>Diện tích</span>
                            <div>
                                <input
                                    type="number"
                                    placeholder="tối thiểu"
                                    name="minSquare"
                                    defaultValue={
                                        minSquare && Number(minSquare)
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="tối đa"
                                    name="maxSquare"
                                    defaultValue={
                                        maxSquare && Number(maxSquare)
                                    }
                                />
                                <Select placeholder="Sắp xếp" name="arrangeSquare">
                                    <option
                                        value="ASC"
                                        selected={arrangeSquare === 'ASC'}
                                    >
                                        Tăng dần
                                    </option>
                                    <option
                                        value="DESC"
                                        selected={arrangeSquare === 'DESC'}
                                    >
                                        Giảm dần
                                    </option>
                                </Select>
                            </div>
                        </div>
                        <Button type="submit" colorScheme="blue">
                            Lưu
                        </Button>
                    </form>
                )}
            </div>
            <div className={styles.item__last} onChange={(e:any) => handleSubmitCreatedAt(e.target.value)}>
                <Select>
                    <option value="DESC" selected={createdAt === 'DESC'}>
                        Mới nhất
                    </option>
                    <option value="ASC" selected={createdAt === 'ASC'}>
                        Cũ nhất
                    </option>
                </Select>
            </div>
        </div>
    );
}

const handleFilter = (data: any, currentQuery: any) => {
    Object.keys(data).forEach((key) => {
        if (currentQuery[key]) return;
        if (!data[key]) delete data[key];
    });
    return data;
};
