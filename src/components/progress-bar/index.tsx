import { useEffect, useState } from 'react';
import './index.scss'

export default (props: {
    size?: number;
    progress?: number;
    onChange?: (progress: number) => void
}) => {
    const { progress = 0, size = 24, onChange } = props
    
    const [value, setValue] = useState(progress)
    const [holdon, setHoldon] = useState(false)

    useEffect(() => {
        if(holdon) {
            return
        }
        setValue(progress)
    }, [holdon, progress])

    return (
        <div className="audio-player-progress-bar" style={{ height: size }}>
            <div className="audio-player-progress-bar-line">
                <div className="audio-player-progress-bar-handler" style={{ left: `${value * 100}%` }}></div>
            </div>
            <input className="audio-player-progress-bar-input" type="range" min={0} max={1} step={0.001} value={value}
                    onMouseDown={() => {
                        setHoldon(true)
                    }}
                    onTouchStart={() => {
                        setHoldon(true)
                    }}
                    onMouseUp={() => {
                        setHoldon(false)
                        typeof onChange === 'function' && onChange(value)
                    }}
                    onTouchEnd={() => {
                        setHoldon(false)
                        typeof onChange === 'function' && onChange(value)
                    }}
                    onChange={e => {
                        const value = Number(e.target.value || 0)
                        setValue(value)
                    }}
                />
        </div>
    )
}