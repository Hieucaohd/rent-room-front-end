import { useCallback, useEffect, useState } from 'react';

const useResize: (size?: number) => [boolean, boolean, () => void] = (size = 500) => {
    const [mobile, setMobile] = useState(false);
    const [state ,render] = useState(true)
    useEffect(() => {
        const rz = () => {
            if (!mobile && window.innerWidth < size) {
                setMobile(true);
            } else if (mobile && window.innerWidth >= size) {
                setMobile(false);
            }
        };
        rz();
        window.addEventListener('resize', rz);

        return () => {
            window.removeEventListener('resize', rz);
        };
    }, [mobile]);

    const reRender = useCallback(() => render(prev => !prev),[])

    return [mobile, state, reRender];
};

export default useResize;
