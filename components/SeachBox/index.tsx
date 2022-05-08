import { Button, Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import styles from './styles.module.scss';

export interface ISearchBoxProps {}

interface SearchResult {
    id: string;
    doc: {
        province: number;
        district: number;
        ward: number;
        name: string;
    };
}

export default function SearchBox(props: ISearchBoxProps) {
    const router = useRouter();
    const [showDropDown, setShowDropDown] = useState(false);
    const typingTimeoutRef = useRef<any>(null);
    const [searchResult, setSearchResult] = useState<SearchResult[]>([]);

    function handleSearchForm(e: any) {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(async () => {
            const response = await fetch('/api/address?query=' + e.target.value + '&limit=5');
            const result = await response.json();
            setSearchResult(result);
        }, 500);
    }

    function handleSeach(province: number, district: number, ward: number) {
        router.push({
            pathname: 'search',
            query: {province, district, ward}
        })
    }

    return (
        <div className={styles.searchBox}>
            {showDropDown && <div className={styles.overlay} onClick={() => setShowDropDown(false)}></div>}
            <div className={styles.searchBox__input} style={{ ...(showDropDown ? { borderBottomLeftRadius: 0 } : {}) }}>
                <Input
                    placeholder="Khu vực của bạn"
                    border="none"
                    _focus={{
                        outline: 'none',
                    }}
                    onFocus={() => setShowDropDown(true)}
                    onChange={handleSearchForm}
                />
                <Button
                    _focus={{
                        outline: 'none',
                    }}
                >
                    <i className="fa-solid fa-magnifying-glass"></i>
                </Button>
            </div>
            {showDropDown && (
                <ul>
                    <li>
                        <i className="fa-solid fa-location-crosshairs"></i> Tìm quanh đây
                    </li>
                    {searchResult.map(({ doc }, index) => (
                        <li
                            key={index}
                            onClick={() => handleSeach(doc.province, doc.district, doc.ward)}
                        >
                            <i className="fa-solid fa-magnifying-glass"></i> {doc.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
