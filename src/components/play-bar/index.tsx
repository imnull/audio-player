import Button from '~/components/button'
import ProgressBar from '~/components/progress-bar'
import './index.scss'
import { useState } from 'react'

export type TPlayStatus = 'ready' | 'waiting' | 'playing'

const getTimeStr = (progress: number, duration: number, desc: boolean = false) => {
    if(!duration) {
        return `--:--`
    }
    const p = desc ? (1 - progress) : progress
    const S = (p * duration) >> 0
    const sec = S % 60
    const min = (S - sec) / 60 >> 0
    return `${`${min}`.padStart(2, '0')}:${`${sec}`.padStart(2, '0')}`
}

export default (props: {
    mode?: 'mini' | 'normal' | 'full';
    duration?: number;
    onClickPlay?: () => void;
    onClickStop?: () => void;
    onClickNext?: () => void;
    onClickPrevious?: () => void;
    onChangeProgress?: (percent: number) => void;
    status?: TPlayStatus;
    previous?: boolean;
    next?: boolean;
    progress?: number;
}) => {
    const {
        mode = 'normal',
        status = 'ready',
        duration = 0,
        onClickPlay,
        onClickStop,
        onClickNext,
        onClickPrevious,
        onChangeProgress,
        previous = false,
        next = false,
        progress = 0,
    } = props

    const buttonSize = 24
    const buttonColor = '#222'
    const buttonDisabledColor = '#aaa'

    const [desc, setDesc] = useState(false)

    return <div className={`audio-player-play-bar ${mode}`}>
        <div className='button-group'>
            <Button name={'backward'} disabled={!previous} color={buttonColor} disabledColor={buttonDisabledColor} size={buttonSize} onTap={onClickPrevious} />
            <Button name={status === 'ready' ? 'play' : 'stop'} disabled={status==='waiting'} color={buttonColor} disabledColor={buttonDisabledColor} size={buttonSize}
                onTap={() => {
                    if(status === 'playing') {
                        typeof onClickStop === 'function' && onClickStop()
                    } else if(status === 'ready') {
                        typeof onClickPlay === 'function' && onClickPlay()
                    }
                }}
            />
            <Button name={'forward'} disabled={!next} color={buttonColor} disabledColor={buttonDisabledColor} size={buttonSize} onTap={onClickNext} />
            <ProgressBar progress={progress} size={buttonSize} onChange={onChangeProgress} />
            <div className="timer" onClick={() => setDesc(!desc)}>{status === 'waiting' ? '--:--' : getTimeStr(progress, duration, desc)}</div>
        </div>
    </div>
}