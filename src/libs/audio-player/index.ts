export type TPlayer = {
    play: () => Promise<void>;
    stop: () => void;
    getSource: () => AudioNode;
}


export type TTrackOptions = {
    onStart?: () => void;
    onEnded?: () => void;
    onError?: (err: any) => void;
    onProgress?: (percent: number) => void;
}

export type TAudioGraphics = {
    connect: (node: AudioNode) => void;
    disconnect: (node: AudioNode) => void;
}

export const createGraphics = async (options: {
    fftSize?: number;
    onProcess?: (data: { spectrum: Float32Array, frequency: Uint8Array }) => void,
}): Promise<TAudioGraphics> => {
    const context = new AudioContext()
    const { fftSize = 32, onProcess = () => { } } = options

    await context.audioWorklet.addModule('worklets/spectrum-processor.js')
    const worklet = new AudioWorkletNode(context, 'spectrum-processor')
    worklet.port.onmessage = (event) => {
        const spectrum = event.data
        analyser.getByteFrequencyData(frequency)
        onProcess({ spectrum, frequency })
    }

    // 创建 AnalyserNode 用于频谱分析
    const analyser = context.createAnalyser();
    analyser.fftSize = fftSize;  // 设置 FFT 大小
    const bufferLength = analyser.frequencyBinCount;
    const frequency = new Uint8Array(bufferLength);

    return {
        getContext() {
            return context
        },
        connect: (node: AudioNode) => {
            node.connect(analyser);
            node.connect(worklet);
        },
        disconnect: (node: AudioNode) => {
            node.disconnect(analyser);
            node.disconnect(worklet);
        },
    }
}

export type TTrack = {
    connect: (destination: AudioDestinationNode) => void;
    play: () => Promise<void>;
    stop: () => void;
}

export interface IAudioElementTrack {
    play(src: string): Promise<void>;
    stop(): void;
    seek(percent: number): number;
    connect: (destination: AudioNode) => void;
    disconnect: () => void;
}

// export class AudioBufferTrack implements IAudioTrack {
//     private readonly context: AudioContext
//     private readonly source: AudioBufferSourceNode

//     onStart?: () => void;
//     onEnded?: () => void;
//     onError?: (err: any) => void;

//     constructor(context: AudioContext, buffer: AudioBuffer) {
//         this.context = context
//         this.source = new AudioBufferSourceNode(context, { buffer, loop: false })
//         this.source.onended = () => {
//             if (typeof this.onEnded === 'function') {
//                 this.onEnded()
//             }
//         }
//         this.resume()
//     }
//     connect(destination: AudioNode) {
//         this.source.connect(destination)
//     }

//     resume() {
//         this.source.connect(this.context.destination)
//     }

//     disconnect() {
//         this.source.disconnect()
//     }

//     async play() {
//         try {
//             this.source.start(0)
//             typeof this.onStart === 'function' && this.onStart()
//         } catch (err) {
//             if (typeof this.onError === 'function') {
//                 this.onError(err)
//             }
//         }
//     }

//     stop() {
//         try {
//             this.source.stop(0)
//             typeof this.onEnded === 'function' && this.onEnded()
//         } catch (err) {
//             if (typeof this.onError === 'function') {
//                 this.onError(err)
//             }
//         }
//     }
// }

export class AudioElementTrack implements IAudioElementTrack {

    private readonly context: AudioContext
    private readonly source: MediaElementAudioSourceNode
    private readonly audio: HTMLAudioElement

    onStart?: () => void;
    onEnded?: () => void;
    onError?: (err: any) => void;
    onProgress?: (percent: number) => void;

    constructor(context: AudioContext) {
        const audio = document.createElement('audio')
        audio.setAttribute('crossOrigin', 'anonymous')

        this.source = context.createMediaElementSource(audio)
        this.audio = audio
        this.context = context

        this.source.connect(this.context.destination)

        this.audio.onended = () => {
            typeof this.onEnded === 'function' && this.onEnded()
        }
        this.audio.ontimeupdate = () => {
            if (!this.audio.duration || typeof this.onProgress !== 'function') {
                return
            }
            this.onProgress(this.audio.currentTime / this.audio.duration)
        }
    }

    canSeek() {
        if (isNaN(this.audio.duration) || !this.audio.duration || this.audio.duration === Infinity) {
            return false
        }
        return true
    }

    seek(percent: number) {
        if (!this.canSeek()) {
            return 0
        }
        // console.log(this.audio.seekable)
        // console.log(this.audio.seeking)
        // const prop = this.audio.duration
        // console.log(111111, prop)
        const per = Math.min(1, Math.max(0, percent))
        return this.audio.currentTime = this.audio.duration * per
    }

    async play(src: string) {
        this.audio.setAttribute('src', src)
        this.audio.currentTime = 0
        await this.audio.play()
        typeof this.onStart === 'function' && this.onStart()
    }
    stop() {
        this.audio.pause()
        this.audio.currentTime = 0
        typeof this.onEnded === 'function' && this.onEnded()
    }

    connect(destination: AudioNode) {
        this.source.connect(destination)
    }
    disconnect() {
        this.source.disconnect()
    }

}

export interface IAudioGraphics {
    start: () => void;
    stop: () => void;
    connect: (track: IAudioElementTrack) => void;
    disconnect: () => void;
}

export interface IAudioPlayerPlugin<T> {
    getName(): string;
    start(): void;
    stop(): void;
    connect: (track: IAudioElementTrack) => void;
    disconnect: () => void;
    regist(callback: TAudioPluginCallback<T>): void
    reset(): void
}

type TAudioPluginCallback<T> = { (data: T, id: string): void }

export abstract class AudioPlayerPlugin<T> implements IAudioPlayerPlugin<T> {
    private readonly name: string
    private readonly callbacks: TAudioPluginCallback<T>[]
    protected readonly context: AudioContext

    constructor(name: string, context: AudioContext) {
        this.name = name
        this.context = context
        this.callbacks = []
    }
    getName(): string {
        return this.name
    }
    regist(callback: TAudioPluginCallback<T>): void {
        this.callbacks.push(callback)
    }
    reset() {
        this.callbacks.slice(0, this.callbacks.length)
    }

    protected invokeCallback(data: T) {
        const name = this.getName()
        this.callbacks.forEach(callback => {
            callback(data, name)
        })
    }

    abstract start(): void;
    abstract stop(): void;
    abstract connect(track: IAudioElementTrack): void;
    abstract disconnect(): void;

}

export class AudioMaster {
    private readonly context: AudioContext

    private readonly plugins: IAudioPlayerPlugin<any>[]

    private readonly pluginCallbackMap: Record<string, TAudioPluginCallback<any>>

    constructor() {
        this.context = new AudioContext()
        this.plugins = []
        this.pluginCallbackMap = {}
    }

    getContext() {
        return this.context
    }

    private invokePluginCallbacks(data: any, name: string) {
        const { [name]: callback } = this.pluginCallbackMap
        if(callback) {
            callback(data, name)
        }
    }

    createPlayerTrack(options: TTrackOptions): IAudioElementTrack {
        const {
            onStart,
            onEnded,
            onError,
            onProgress,
        } = options

        const track = new AudioElementTrack(this.context)
        track.onStart = onStart
        track.onEnded = onEnded
        track.onProgress = onProgress
        track.onError = onError
        this.plugins.forEach(plugin => {
            plugin.connect(track)
            plugin.start()
        })
        return track
    }

    registPlugin<T = any>(plugin: IAudioPlayerPlugin<T>) {
        plugin.regist((data, name) => {
            this.invokePluginCallbacks(data, name)
        })
        this.plugins.push(plugin)
    }

    on<T = any>(name: string, cb: TAudioPluginCallback<T>) {
        this.pluginCallbackMap[name] = cb
    }

    reset() {
        this.plugins.forEach(p => {
            p.stop()
            p.disconnect()
            p.reset()
        })
        this.plugins.splice(0, this.plugins.length)
    }

    createGraphics(options: {
        fftSize?: number;
        onProcess?: (frequency: Uint8Array) => void,
    } = {}): IAudioGraphics {
        const { context } = this
        const { fftSize = 32, onProcess = () => { } } = options

        const graphics = new AudioGraphicsPlugin(context)
        graphics.fftSize = fftSize
        return graphics
    }
}

export class AudioGraphicsPlugin extends AudioPlayerPlugin<Uint8Array> {

    fftSize: number = 32
    private readonly analyser: AnalyserNode

    constructor(context: AudioContext) {
        super('AudioGraphicsPlugin', context)
        this.analyser = context.createAnalyser()
    }

    private frameHandle: any = 0
    start() {
        const loop = () => {
            this.analyser.fftSize = this.fftSize;  // 设置 FFT 大小
            const frequency = new Uint8Array(this.analyser.frequencyBinCount)
            this.analyser.getByteFrequencyData(frequency)
            this.invokeCallback(frequency)
            requestAnimationFrame(loop)
        }
        this.frameHandle = requestAnimationFrame(loop)
    }

    stop() {
        cancelAnimationFrame(this.frameHandle)
        return this
    }

    connect(track: IAudioElementTrack) {
        track.connect(this.analyser)
    }
    disconnect() {
        this.analyser.disconnect()
    }
}

export { drawData, drawFrequency, drawSpectrum } from './utils'