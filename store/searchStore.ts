import create from 'zustand'

interface SearchStore {
    roomHovered: string;
    setRoomHovered: (_id: string) => void;
}

const useSearchStore = create<SearchStore>((set) => ({
    roomHovered: "",
    setRoomHovered: (_id: string) => {set(state => ({roomHovered: _id}))}
}))

export default useSearchStore;