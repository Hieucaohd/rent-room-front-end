const keys = [37, 38, 39, 40];

const preventDefault = (e: Event) => {
    e.preventDefault();
};

function preventDefaultTounch(e: TouchEvent) {
    e.preventDefault();
}

function preventDefaultForScrollKeys(e: KeyboardEvent) {
    if (keys.includes(e.keyCode)) {
        e.preventDefault();
        return false;
    }
}

// modern Chrome requires { passive: false } when adding event
const useScrollController = () => {
    let supportsPassive = false;
    const html = document.querySelector('html');
    try {
        html &&
            html.addEventListener(
                'test',
                () => {},
                Object.defineProperty({}, 'passive', {
                    get: function () {
                        supportsPassive = true;
                    },
                })
            );
    } catch (e) {}

    var wheelOpt = supportsPassive ? { passive: false } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    function disableScroll() {
        const html = document.querySelector('html');
        if (html) {
            html.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
            html.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
            // html.addEventListener('touchmove', preventDefaultTounch, wheelOpt); // mobile
            html.addEventListener('keydown', preventDefaultForScrollKeys, false);
        }
    }

    // call this to Enable
    function enableScroll() {
        const html = document.querySelector('html');
        if (html) {
            html.removeEventListener('DOMMouseScroll', preventDefault, false);
            html.removeEventListener(wheelEvent, preventDefault);
            // html.removeEventListener('touchmove', preventDefaultTounch);
            html.removeEventListener('keydown', preventDefaultForScrollKeys, false);
        }
    }

    return { disableScroll, enableScroll };
};

export default useScrollController;
