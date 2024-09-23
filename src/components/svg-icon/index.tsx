type TGenSvgOptions = {
    size?: number;
    strokeSize?: number;
    strokeStyle?: string;
    fillStyle?: string;
    viewBox?: string;
}

const DEFAULT_SIZE = 48
const DEFAULT_FILL = '#000000'

const svgGen = (path: string) => (options: TGenSvgOptions) => {
    const {
        size = DEFAULT_SIZE,
        strokeSize = 0,
        strokeStyle = '',
        fillStyle = DEFAULT_FILL,
        viewBox = '0 0 24 24',
    } = options
    const arr: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="${fillStyle}"`]
    if(strokeSize && strokeStyle) {
        arr.push(` stroke="${strokeStyle}" stroke-width="${strokeSize}"`)
    }
    arr.push(`>${path}</svg>`)
    return arr.join('')
}

const GenMap = {
    backward: svgGen(`<path d="M14 14.74L21 19V5l-7 4.26V5L2 12l12 7v-4.26z" />`),
    forward: svgGen(`<path d="M10 14.74L3 19V5l7 4.26V5l12 7-12 7v-4.26z" />`),
    play: svgGen(`<path d="M20 12L5 21V3z" />`),
    stop: svgGen(`<rect width="14" height="14" x="5" y="5" />`),
    pause: svgGen(`<rect width="4" height="16" x="5" y="4" /><rect width="4" height="16" x="15" y="4" />`),
    // addToList: (options: TGenSvgOptions) => {
    //     const gen = svgGen(`<path d="M6 10H18" /><path d="M6 6H18" /><path d="M6 14H10" /><path d="M14 16H18" /><path d="M16 14L16 18" /><path d="M6 18H10" />`)
    //     const { fillStyle = DEFAULT_FILL, size = DEFAULT_SIZE } = options
    //     return gen({ size, strokeSize: 0.5, strokeStyle: fillStyle })
    // },
}

const encSvgData = (svg: string) => {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export type TIconNames = keyof typeof GenMap

export default (props: { name?: TIconNames } & TGenSvgOptions) => {
    const { name = 'play', size = 48, ...rest } = props
    return <img width={size} height={size} src={encSvgData(GenMap[name]({ ...rest, size }))}  />
}