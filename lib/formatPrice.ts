export const formatPrice = (price: string | number) => {
    return `${price}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
};
