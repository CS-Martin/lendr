interface IconProps {
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export const EthereumIcon = ({
    width,
    height,
    color,
    className,
}: IconProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            version='1.1'
            xmlnsXlink='http://www.w3.org/1999/xlink'
            width={width}
            height={height}
            x='0'
            y='0'
            viewBox='0 0 128 128'
            enableBackground='new 0 0 512 512'
            xmlSpace='preserve'
            className={className}>
            <g>
                <path
                    d='M28.09 65.65 64 7l35.91 58.65L64 86.57z'
                    fill={color}
                    opacity='1'
                    className=''></path>
                <path
                    d='m64 93.16 34.76-21.58L64 121 28.42 71.58z'
                    fill={color}
                    opacity='1'
                    className=''></path>
            </g>
        </svg>
    );
};
