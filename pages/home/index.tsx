import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { withAuth } from '../../lib/withAuth';

export interface IHomePageProps {
    user: any;
}

const Home = ({ user }: IHomePageProps) => {
    const router = useRouter()
    return (
        <>
            <a onClick={() => router.push('/')}>index</a>
            hello day la home page
        </>
    );
};

export const getServerSideProps: GetServerSideProps = withAuth(
    (context: GetServerSidePropsContext) => {
        return {};
    }
);

export default Home;
