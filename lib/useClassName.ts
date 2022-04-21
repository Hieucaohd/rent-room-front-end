interface Styles {
    readonly [key: string]: string;
}

export default function useClassName(styles: Styles) {
    const className = (name: string) => {
        const classList = name.split(' ');
        let clsx = '';
        classList.forEach((item, index, far) => {
            const style = styles[item] ? styles[item] : item;
            if (index < far.length - 1) {
                clsx += style + ' ';
            } else {
                clsx += style;
            }
        });
        return { className: clsx };
    };
    return [className];
}
