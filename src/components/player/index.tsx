import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioGraphicsPlugin, AudioMaster, drawFrequency } from '~/libs/audio-player'
import PlayBar, { TPlayStatus } from '~/components/play-bar'
import PlayList from '~/components/play-list'
import { TPlayListItem, updateCacheList, getCacheList, removeAudioFromIndexedDB } from '~/libs/audio-player/utils'
import './index.scss'

export const PlayerCore = (props: {
    master: AudioMaster;
    width?: number;
}) => {

    const { master, width = 420 } = props

    const [list, setList] = useState<TPlayListItem[]>([])
    const [playStatus, setPlayStatus] = useState<TPlayStatus>('waiting')
    const listRef = useRef(list)
    useEffect(() => {
        listRef.current = list; // 每次 list 更新时，更新 ref 的值
        if(list.length > 0 && playStatus === 'waiting') {
            setPlayStatus('ready')
        }
    }, [list, playStatus])

    const [current, setCurrent] = useState(0)
    const currentRef = useRef(current)
    useEffect(() => {
        currentRef.current = current
    }, [current])

    const [duration, setDuration] = useState(0)
    const [track] = useState(master.createPlayerTrack({
        onEnded: () => {
            play(currentRef.current + 1)
        },
        onStart: () => {
            // setPlayStatus('playing')
        },
        onProgress: percent => {
            setProgress(percent)
        }
    }))

    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!canvas) {
            return
        }
        const ctx = canvas.getContext('2d')
        if (ctx) {
            master.on<Uint8Array>('AudioGraphicsPlugin', data => {
                drawFrequency(ctx, data)
            })
        }
    }, [master, canvas])

    

    useEffect(() => {
        getCacheList().then(list => {
            setList(list)
            if(list.length > 0) {
                setPlayStatus('ready')
            } else {
                setPlayStatus('waiting')
            }
        })
        return () => {
            track.pause()
            track.disconnect()
        }
    }, [])

    const play = (cur: number) => {
        if(listRef.current.length < 1) {
            return
        }
        if(cur < 0) {
            cur += listRef.current.length
        }
        cur = cur % listRef.current.length
        setCurrent(cur)
        const item = listRef.current[cur]
        if(item) {
            setPlayStatus('waiting')
            track.play(item.url).then(() => {
                setPlayStatus('playing')
                setDuration(track.getDuration())
            })
        }
    }

    return <div className="audiu-player-wrapper" style={{ width }}>
        <canvas className="" ref={setCanvas} width={width} height={60} />
        <PlayBar
            status={playStatus}
            duration={duration}
            progress={progress}
            previous={list.length > 1 && playStatus !== 'waiting'}
            next={list.length > 1 && playStatus !== 'waiting'}
            onClickPlay={() => {
                play(current)
            }}
            onClickStop={() => {
                track.pause()
                setPlayStatus('ready')
            }}
            onChangeProgress={percent => {
                setProgress(percent)
                track.seek(percent)
            }}
            onClickNext={() => {
                play(current + 1)
            }}
            onClickPrevious={() => {
                play(current - 1)
            }}
        />
        <PlayList
            list={list}
            width={width}
            current={current}
            onSelect={idx => {
                play(idx)
            }}
            onRemove={(idx, item) => {
                list.splice(idx, 1)
                setList([...list])
                updateCacheList(list)
                removeAudioFromIndexedDB(item.id)

                if(idx === current) {
                    track.pause()
                    if(list.length > 0) {
                        play(current % list.length)
                    } else {
                        setPlayStatus('waiting')
                    }
                }
                
            }}
            onChange={list => {
                setList(list)
                updateCacheList(list)
            }}
        />
    </div>
}

const Loading = () => {
    return <div className="audio-player-loading">Loading</div>
}

const Enter = (props: {
    onClick?: () => void;
}) => {
    const { onClick } = props
    return <div className="audio-player-enter" onClick={onClick}>Enter</div>
}

export default (props: {
    width?: number;
}) => {
    const { width = 320 } = props

    const [master, setMaster] = useState<AudioMaster | null>(null)


    return <div>
        {master ? <PlayerCore master={master} width={width} /> : <Enter onClick={() => {
            const master = new AudioMaster()
            const analyzePlugin = new AudioGraphicsPlugin(master.getContext())
            analyzePlugin.fftSize = 64
            master.registPlugin(analyzePlugin)
            setMaster(master)
            return () => {
                master.reset()
            }
        }} />}
    </div>
}