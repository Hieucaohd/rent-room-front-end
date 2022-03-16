import create from 'zustand';

export interface UserStore {
    user: any,
    setUser: (user:any) => void,
    removeUser: () => void
}

export const useStore = create<UserStore>((set) => ({
    user: null,
    setUser: (user:any) => {
        console.log(user);
        set({user: user})
    },
    removeUser: () => {
        set({user: null})
    }
}));
