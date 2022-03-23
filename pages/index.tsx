import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import Header from '../components/Header';
import { withAuth } from '../lib/withAuth';

export interface IHomePageProps {
    user: any;
}

const Home = ({ user }: IHomePageProps) => {
    return (
        <>
            <Link href='/home'>
                <a>home</a>
            </Link>
            hello day la index page
        </>
    );
};

export const getServerSideProps: GetServerSideProps = withAuth(
    (context: GetServerSidePropsContext) => {
        return {};
    }
);

export default Home;
