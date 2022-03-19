import { useEffect, useState } from "react";


const useResize = (size = 500) => {
    const [mobile, setMobile] = useState(false)
    useEffect(() => {
        const rz = () => {
            if (!mobile && window.innerWidth < size) {
                setMobile(true)
            } else if (mobile && window.innerWidth >= size) {
                setMobile(false)
            }
        }
        rz()
        window.addEventListener('resize', rz)

        return () => {
            window.removeEventListener('resize', rz)
        }
    })

    return [mobile];
};

export default useResize