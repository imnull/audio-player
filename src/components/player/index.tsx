import { useEffect, useState } from 'react'
import { AudioMaster, AudioGraphicsPlugin, drawFrequency } from '~/libs/audio-player'
import PlayBar, { TPlayStatus } from '~/components/play-bar'

const initDnD = (dropArea: HTMLElement, callback: (files: File[]) => void) => {

    const preventDefaults = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: any) => {
        const dt = e.dataTransfer;
        const files: File[] = dt.files.length ? Array.from(dt.files) : [];
        console.log(1111111, files)
        callback(files)
    }

    // 阻止默认的拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    // 当拖拽文件进入/悬停/离开时，修改样式
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
    });

    // 处理文件拖放
    dropArea.addEventListener('drop', handleDrop, false);
}


export default (props: {
    master: AudioMaster
}) => {

    const { master } = props

    const [playStatus, setPlayStatus] = useState<TPlayStatus>('waiting')
    const [track] = useState(master.createPlayerTrack({
        onEnded: () => {
            setPlayStatus('ready')
            setProgress(0)
        },
        onStart: () => {
            // setPlayStatus('playing')
        },
        onProgress: percent => {
            setProgress(percent)
        }
    }))
    const [src, setSrc] = useState('')

    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
    const [progress, setProgress] = useState(0)

    const [listDom, setListDom] = useState<HTMLElement | null>(null)
    const [files, setFiles] = useState<File[]>([])

    useEffect(() => {
        if (!canvas) {
            return
        }
        const ctx = canvas.getContext('2d')
        if(ctx) {
            master.on<Uint8Array>('AudioGraphicsPlugin', data => {
                drawFrequency(ctx, data)
            })
        }
    }, [master, canvas])

    useEffect(() => {
        if (listDom) {
            initDnD(listDom, setFiles)
        }
    }, [listDom])

    useEffect(() => {
        if(!src) {
            return
        }
        track.play(src).then(() => {
            setPlayStatus('playing')
        })
    }, [src])

    useEffect(() => {
        return () => {
            track.stop()
            track.disconnect()
        }
    }, [])


    return <div className="audiu-player-wrapper">
        <canvas ref={setCanvas} width={500} height={120} style={{ border: '1px solid #ccc' }} />
        <hr />
        <PlayBar
            status={playStatus}
            progress={progress}
            onClickPlay={() => {
                track.play(src).then(() => {
                    setPlayStatus('playing')
                })
            }}
            onClickStop={() => {
                track.stop()
                setPlayStatus('ready')
            }}
            onChangeProgress={percent => {
                console.log(211111, percent)
                setProgress(percent)
                track.seek(percent)
            }}
        />
        <ul className="list" ref={setListDom}>
            {
                files.length > 0
                ? files.map((file, idx) => <li key={idx} onDoubleClick={async () => {
                    const url = URL.createObjectURL(file)
                    setSrc(url)
                    setPlayStatus('waiting')
                }}>{file.name}</li>)
                : <li style={{ color: '#ccc' }}>drag mp3 files to here</li>
            }
        </ul>
    </div>
}