import Header from '../../components/Header';
import { motion } from 'framer-motion';
import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function homeTest(props: any) {
    const router = useRouter()
    return (
        <>
            <Header user={null} />
            <motion.div
                initial={{
                    opacity: 0,
                    marginTop: '100px'
                }}
                animate={{
                    opacity: 1,
                    marginTop: '100px'
                }}
                exit={{
                    opacity: 0,
                    marginTop: '100px'
                }}
            >
                <Button colorScheme='teal' onClick={() => {
                    router.push('/test/profile')
                }}>Profile</Button>
            </motion.div>
        </>
    );
}
