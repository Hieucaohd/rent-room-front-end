import create from 'zustand';

type User = typeof initialState;

interface UserStore {
    user: User,
    setUser: (args:User) => void,
    removeUser: () => void
}

const initialState = function () {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {
        return {};
    }
}();

const userStore = create<UserStore>((set) => ({
    user: initialState,
    setUser: (args:User) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(args || {}));
        }
        set({user: args});
    },
    removeUser: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("user");
        }
        set({user: {}});
    }
}));

export default userStore;