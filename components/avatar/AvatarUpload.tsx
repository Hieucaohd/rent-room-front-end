import { Avatar, AvatarBadge } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

interface AvatarUploadProps {
    src: string;
    name: string;
    updateData?: (link: string) => void;
}

export default function AvatarUpload({ src, name, updateData }: AvatarUploadProps) {
    const upload = useRef<HTMLInputElement>(null);
    const [link, setLink] = useState<string>(src);

    useEffect(() => {
        if (link) {
            updateData && updateData(link);
        }
        return () => {
            if (link) {
                window.URL.revokeObjectURL(link);
            }
        };
    }, [link]);

    return (
        <>
            <Avatar
                name={name}
                size="2xl"
                position="relative"
                src={link}
                children={
                    <>
                        <svg
                            onClick={() => {
                                upload.current?.click();
                            }}
                            cursor="pointer"
                            width={'calc(100%)'}
                            height={'calc(100%)'}
                        >
                            <circle
                                strokeLinecap="round"
                                stroke-mitterlimit="0"
                                cx="50%"
                                cy="50%"
                                r="calc((100% - 3px)/2)"
                                strokeWidth="3px"
                                stroke="gray"
                                fill="transparent"
                            />
                        </svg>
                        <AvatarBadge boxSize="2em" bgColor="gray" transform="translate(-10%, -10%)">
                            <i className="fa-solid fa-camera"></i>
                        </AvatarBadge>
                        <input
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const newLink = window.URL.createObjectURL(e.target.files[0]);
                                    setLink(newLink);
                                }
                            }}
                            type="file"
                            ref={upload}
                            style={{
                                display: 'none',
                            }}
                        />
                    </>
                }
            />
        </>
    );
}
