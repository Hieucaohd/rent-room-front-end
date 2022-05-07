import { Button, Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import styles from "./styles.module.scss";

export interface ISearchBoxProps {}

export default function SearchBox(props: ISearchBoxProps) {
    const router = useRouter();
    const [showDropDown, setShowDropDown] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    function handleSearchForm (e:any) {
        
        if(typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout( () => {
            console.log("vcl")
        }, 500)
    };

    return (
        <div style={{...showDropDown ? {borderBottomLeftRadius: 0} : {}}}>
            <Input
                placeholder="Khu vực của bạn"
                border="none"
                _focus={{
                    outline: 'none',
                }}
                onFocus={() => setShowDropDown(true)}
                onBlur={() => setShowDropDown(false)}
                onChange = {handleSearchForm}
            />
            <Button
                _focus={{
                    outline: 'none',
                }}
            >
                <i className="fa-solid fa-magnifying-glass"></i>
            </Button>
            {showDropDown && <ul>
                <li>
                    <i className="fa-solid fa-location-crosshairs"></i> Tìm quanh đây 
                </li>
            </ul>}
        </div>
    );
}
