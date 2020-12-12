import * as React from 'react';
export function PrevIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className='prefix__icon prefix__icon-tabler prefix__icon-tabler-player-skip-back'
            width='1em'
            height='1em'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='#2c3e50'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            {...props}
        >
            <path
                d='M0 0h24v24H0z'
                stroke='none'
            />
            <path d='M20 5v14L8 12zM4 5v14'/>
        </svg>
    );
}
export function NextIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className='prefix__icon prefix__icon-tabler prefix__icon-tabler-player-skip-forward'
            width='1em'
            height='1em'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='#2c3e50'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            {...props}
        >
            <path
                d='M0 0h24v24H0z'
                stroke='none'
            />
            <path d='M4 5v14l12-7zM20 5v14'/>
        </svg>
    );
}
export function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className='prefix__icon prefix__icon-tabler prefix__icon-tabler-player-pause'
            width='1em'
            height='1em'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='#2c3e50'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            {...props}
        >
            <path
                d='M0 0h24v24H0z'
                stroke='none'
            />
            <rect
                x={6}
                y={5}
                width={4}
                height={14}
                rx={1}
            />
            <rect
                x={14}
                y={5}
                width={4}
                height={14}
                rx={1}
            />
        </svg>
    );
}

export function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className='prefix__icon prefix__icon-tabler prefix__icon-tabler-player-play'
            width='1em'
            height='1em'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='#2c3e50'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            {...props}
        >
            <path
                d='M0 0h24v24H0z'
                stroke='none'
            />
            <path d='M7 4v16l13-8z'/>
        </svg>
    );
}

export function PlayPauseIcon({playing}: { playing: boolean }) {
    return playing ? <PauseIcon/> : <PlayIcon/>;
}
