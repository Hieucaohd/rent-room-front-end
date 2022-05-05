import { Button, Select } from '@chakra-ui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './styles.module.scss';

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
        minWaterPrice,
        maxWaterPrice,
        minElectricityPrice,
        maxElectricityPrice,
        minSquare,
        maxSquare,
        sort,
    } = router.query;

    const isPriceFilter = minPrice || maxPrice;
    const isWaterFilter = minWaterPrice || maxWaterPrice;
    const isElectricityFilter = minElectricityPrice || maxElectricityPrice;
    const isFilterSquare = minSquare || maxSquare;

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

    const handleSubmitSort = (sort: string) => {
        router.push({
            pathname: 'search',
            query: {
                ...router.query,
                sort,
            },
        });
    };

    const handleResetPrice = () => {
        router.push({
            pathname: 'search',
            query: {
                ...router.query,
                minPrice: undefined,
                maxPrice: undefined,
            },
        });
        setDropDown(DropDown.NONE);
    };

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
                            </div>
                        </div>
                        <Button colorScheme="red" marginRight={2} onClick={handleResetPrice}>
                            Xoá
                        </Button>
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
                                    defaultValue={minSquare && Number(minSquare)}
                                />
                                <input
                                    type="number"
                                    placeholder="tối đa"
                                    name="maxSquare"
                                    defaultValue={maxSquare && Number(maxSquare)}
                                />
                            </div>
                        </div>
                        <Button type="submit" colorScheme="blue">
                            Lưu
                        </Button>
                    </form>
                )}
            </div>
            <div
                className={styles.item__last}
                onChange={(e: any) => handleSubmitSort(e.target.value)}
            >
                <Select>
                    <option value="newest" selected={sort === 'newest'}>
                        Mới nhất
                    </option>
                    <option value="oldest" selected={sort === 'oldest'}>
                        Cũ nhất
                    </option>
                    <option value="desc" selected={sort === 'desc'}>
                        Giá cao
                    </option>
                    <option value="asc" selected={sort === 'asc'}>
                        Giá thấp
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
