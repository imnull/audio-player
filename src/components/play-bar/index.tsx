import Button from '~/components/button'
import ProgressBar from '~/components/progress-bar'

import './index.scss'
import { useEffect, useState } from 'react';

export type TPlayStatus = 'ready' | 'waiting' | 'playing'

export default (props: {
    mode?: 'mini' | 'normal' | 'full';
    onClickPlay?: () => void;
    onClickStop?: () => void;
    onChangeProgress?: (percent: number) => void;
    status?: TPlayStatus;
    previous?: boolean;
    next?: boolean;
    progress?: number;
}) => {
    const {
        mode = 'normal',
        status = 'ready',
        onClickPlay,
        onClickStop,
        onChangeProgress,
        previous = false,
        next = false,
        progress = 0,
    } = props

    const buttonSize = 24
    const buttonColor = '#222'
    const buttonDisabledColor = '#aaa'

    const invokeProgressEvent = (val: any, method?: (percent: number) => void) => {
        if(typeof method === 'function') {
            method(Number(val || 0))
        }
    }

    const [value, setValue] = useState(progress)
    const [holdon, setHoldon] = useState(false)

    useEffect(() => {
        if(holdon) {
            return
        }
        setValue(progress)
    }, [holdon, progress])

    return <div className={`audio-player-play-bar ${mode}`}>
        <div className='button-group'>
            <Button name={'backward'} disabled={!previous} color={buttonColor} disabledColor={buttonDisabledColor} size={buttonSize} />
            <Button name={status === 'ready' ? 'play' : 'stop'} disabled={status==='waiting'} color={buttonColor} disabledColor={buttonDisabledColor} size={buttonSize}
                onTap={() => {
                    if(status === 'playing') {
                        typeof onClickStop === 'function' && onClickStop()
                    } else if(status === 'ready') {
                        typeof onClickPlay === 'function' && onClickPlay()
                    }
                }}
            />
            <Button name={'forward'} disabled={!next} color={buttonColor} disabledColor={buttonDisabledColor} size={buttonSize} />
            <ProgressBar progress={value} onChange={onChangeProgress} />
        </div>
    </div>
}