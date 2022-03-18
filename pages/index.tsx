import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Header from '../components/Header';
import { withAuth } from '../lib/withAuth';

export interface IHomePageProps {
    user: any;
}

const Home = ({ user }: IHomePageProps) => {
    return (
        <div>
            <Header user={user} />
            hello day la home page
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = withAuth(
    (context: GetServerSidePropsContext) => {
        return {};
    }
);

export default Home;
