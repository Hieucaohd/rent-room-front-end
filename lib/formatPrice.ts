export const formatPrice = (price: string | number) => {
    return `${price}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
};

export const formatPrice1 = (price: string | number) => {
    return `${price}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
