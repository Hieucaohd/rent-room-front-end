import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';

const container = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            delayChildren: 0.4,
            staggerChildren: 0.1,
        },
    },
    out: {
        opacity: 0,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

export default function ForgotNotFound() {
    return (
        <>
            <Head>
                <title>Đổi mật khẩu</title>
            </Head>
            <motion.div className="forgotpw-base">
                <motion.div
                    className="forgotpw"
                    key={2}
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    exit="out"
                >
                    <motion.div className="forgotpw__status forgotpw__status--error">
                        <div>
                            <motion.div
                                initial={{
                                    width: '0%',
                                }}
                                animate={{
                                    width: '100%',
                                }}
                                transition={{
                                    duration: 0.5,
                                }}
                            ></motion.div>
                        </div>
                        <div>
                            <motion.div
                                initial={{
                                    width: '0%',
                                }}
                                animate={{
                                    width: '100%',
                                }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.5,
                                }}
                            ></motion.div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{
                            y: 50,
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        transition={{
                            duration: 1,
                            delay: 1.1,
                        }}
                        className="forgotpw__message"
                    >
                        Phiên làm việc đã hết hạn. Vui lòng gửi yêu cầu mới.
                    </motion.div>
                    <motion.div
                        initial={{
                            y: 50,
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        transition={{
                            duration: 1,
                            delay: 2.1,
                        }}
                        className="forgotpw__link"
                    >
                        <Link href="/signin">
                            <a>Đi tới đăng nhập {' > '}</a>
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </>
    );
}
