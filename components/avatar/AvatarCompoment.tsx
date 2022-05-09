import './AvatarStyle.scss';

export default function AvatarCompoment({
    className,
    width,
    height,
    strokeWidth = 2,
    color = 'gray',
    src,
    bgColor = 'transparent',
    style,
}: any) {
    const r = (width - strokeWidth) / 2;

    return (
        <div
            className={`avatar${className ? ' ' + className : ''}`}
            style={{ width: width, height: height, minWidth: width, minHeight: height }}
        >
            <img
                src={src}
                alt=""
                style={{
                    width: width - strokeWidth,
                    height: height - strokeWidth,
                    top: strokeWidth / 2,
                    left: strokeWidth / 2,
                    ...style,
                }}
            />
            <svg className="avatar__border" width={width} height={height} fill={bgColor}>
                <circle
                    strokeLinecap="round"
                    stroke-mitterlimit="0"
                    cx={width / 2}
                    cy={height / 2}
                    r={r}
                    strokeWidth={strokeWidth}
                    stroke={color}
                    fill="transparent"
                />
            </svg>
        </div>
    );
}
