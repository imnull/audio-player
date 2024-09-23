import { useEffect, useState } from 'react'
import { AudioMaster, IAudioGraphics, IAudioElementTrack, drawFrequency, AudioGraphicsPlugin } from '~/libs/audio-player'
import PlayBar, { TPlayStatus } from '~/components/play-bar'
import Player from '~/components/player'
import './app.scss'



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

export default () => {

    const [master, setMaster] = useState<AudioMaster | null>(null)


    useEffect(() => {

        const master = new AudioMaster()
        const analyzePlugin = new AudioGraphicsPlugin(master.getContext())
        analyzePlugin.fftSize = 64
        master.registPlugin(analyzePlugin)
        setMaster(master)
        return () => {
            master.reset()
        }
    }, [])


    return <div>
        <h1>Audio Player</h1>
        <hr />
        {master ? <Player master={master} /> : null}
    </div>
}