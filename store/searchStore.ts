import create from 'zustand'

interface SearchStore {
    roomHovered: number;
    setRoomHovered: (index: number) => void;
}

const useSearchStore = create<SearchStore>((set) => ({
    roomHovered: -1,
    setRoomHovered: (index:number) => {set(state => ({roomHovered: index}))}
}))

export default useSearchStore;