import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { withAuth } from '../lib/withAuth';

const Home: NextPage = (props) => {
    return <div>Home page</div>;
};

export const getServerSideProps: GetServerSideProps = withAuth(
    (context: GetServerSidePropsContext) => {
        return {};
    }
);

export default Home;
