import create from 'zustand';

interface UserStore {
    id: string,
    name: string,
    login: () => void,
    logout: () => void
}

const userStore = create<UserStore>((set) => ({
    id: '',
    name: '',
    login: async () => {

    },
    logout: async () => {

    }
}));

export default userStore;
