export const getRoomSaved = (userId: string) => {
    if (process.browser) {
        const dt = localStorage.getItem(userId);
        if (dt) {
            const listRoom: any[] = JSON.parse(dt);
            return listRoom;
        }
    }
    return [];
};

export const saveRoom = (userId: string, roomId: string) => {
    if (process.browser) {
        const dt = localStorage.getItem(userId);
        if (dt) {
            const listRoom: any[] = JSON.parse(dt);
            const newList = [roomId, ...listRoom];
            localStorage.setItem(userId, JSON.stringify(newList));
        } else {
            const newList = [roomId];
            localStorage.setItem(userId, JSON.stringify(newList));
        }
    }
};

export const updateRoom = (userId: string, data: string[]) => {
    if (process.browser) {
        localStorage.setItem(userId, JSON.stringify(data));
    }
};
