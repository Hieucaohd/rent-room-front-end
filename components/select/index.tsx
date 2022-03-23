import { Button, InputGroup, InputRightElement } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface SelectionProps {
    children?: ReactNode;
    className?: string;
    option?: ReactNode;
}

export default function SelectComponent({ children, className, option }: SelectionProps) {

    return (
        <>
            <div>
                <Button rightIcon={<i className="fi fi-sr-caret-down"></i>}>{children}</Button>
            </div>
        </>
    );
}
