import { Button, Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

export interface IFilterBarProps {}

export default function FilterBar(props: IFilterBarProps) {
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);
    const router = useRouter();
    const { minPrice, maxPrice, arrangePrice } = router.query;
    const isPriceFilter = minPrice || maxPrice || arrangePrice;
    const handleSubmitPrice = (e: any) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        router.push({
            pathname: 'search',
            query: {
                ...router.query,
                ...handleFilter(data, router.query),
            },
        });
        setShowPriceDropdown(false);
    };
    return (
        <div className={styles.filterbar}>
            <div className={styles.item}>
                <div
                    className={clsx(styles.item__label, isPriceFilter && styles.choose)}
                    onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                >
                    Giá <i className={`fi fi-rr-angle-${showPriceDropdown ? 'up' : 'down'}`}></i>
                </div>
                {showPriceDropdown && (
                    <form className={styles.dropdown__price} onSubmit={handleSubmitPrice}>
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
                                <input type="number" placeholder="tối thiểu" />
                                <input type="number" placeholder="tối đa" />
                                <Select placeholder="Sắp xếp">
                                    <option value="ASC">Tăng dần</option>
                                    <option value="DESC">Giảm dần</option>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <span>Tiền nước</span>
                            <div>
                                <input type="number" placeholder="tối thiểu" />
                                <input type="number" placeholder="tối đa" />
                                <Select placeholder="Sắp xếp">
                                    <option value="ASC">Tăng dần</option>
                                    <option value="DESC">Giảm dần</option>
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
                <div className={styles.item__label}>
                    Tầng <i className="fi fi-rr-angle-down"></i>
                </div>
            </div>
            <div className={styles.item}>
                <div className={styles.item__label}>
                    Diện tích <i className="fi fi-rr-angle-down"></i>
                </div>
            </div>
            <div className={styles.item}>
                <div className={styles.item__label}>Không chung chủ</div>
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
