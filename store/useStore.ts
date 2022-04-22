import { ReactNode } from 'react';
import create from 'zustand';
import { User } from '../lib/withAuth';

interface Store {
    user: {
        info: User | null;
        SSR: boolean;
    };
    addUser: (user: User) => void;
    removeUser: () => void;
    imageprev: ReactNode | null;
    setImages: (img: ReactNode) => void;
    closeImages: () => void;
    popup: ReactNode | null;
    createPopup: (popup: ReactNode) => void;
    removePopup: () => void;
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
    imageprev: null,
    setImages: (imgs) => {
        set((state) => {
            state.imageprev = imgs;
        });
    },
    closeImages: () => {
        set((state) => {
            state.imageprev = null;
        });
    },
    popup: null,
    createPopup: (popup) => {
        set((state) => {
            state.popup = popup;
        });
    },
    removePopup: () => {
        set((state) => {
            state.popup = null;
        });
    },
}));

export default useStore;
