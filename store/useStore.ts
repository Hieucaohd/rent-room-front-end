import create from 'zustand';
import { User } from '../lib/withAuth';

interface Store {
    user: {
        info: User | null;
        SSR: boolean;
    };
    addUser: (user: User) => void;
    removeUser: () => void;
    image: {
        src: string;
        layoutid: any;
    } | null;
    setImage: (img: { src: string; layoutid: any }) => void;
    closeImage: () => void;
}

const useStore = create<Store>((set, get) => ({
    user: {
        info: null,
        SSR: true,
    },
    addUser: (user) =>
        set((state) => ({
            user: {
                info: user,
                SSR: false,
            },
        })),
    removeUser: () =>
        set((state) => {
            state.user.info = null;
            state.user.SSR = false;
        }),
    image: null,
    setImage: (img) => {
        set((state) => {
            state.image = img;
        });
    },
    closeImage: () => {
        set((state) => {
            state.image = null;
        });
    },
}));

export default useStore;
