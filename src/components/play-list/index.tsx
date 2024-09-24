import { useEffect, useRef, useState } from "react"
import { TPlayListItem, genPlayList, initDnD } from '~/libs/audio-player/utils'
import Button from '~/components/button'
import './index.scss'

export default (props: {
    width?: number;
    current?: number;
    list?: TPlayListItem[];
    onSelect?: (idx: number, it: TPlayListItem) => void;
    onChange?: (itmes: TPlayListItem[]) => void;
    onRemove?: (idx: number, it: TPlayListItem) => void;
}) => {
    const { onSelect, onChange, onRemove, current = -1, list = [], width = 420 } = props
    const [listDom, setListDom] = useState<HTMLElement | null>(null)

    const listRef = useRef(list)
    useEffect(() => {
        listRef.current = list
    }, [list])

    useEffect(() => {
        if (listDom) {
            initDnD(listDom, files => {
                if(typeof onChange === 'function') {
                    genPlayList([...listRef.current, ...files]).then(items => {
                        onChange(items)
                    })
                }
            })
        }
    }, [listDom])

    return <ul className="audio-player-list" ref={setListDom} style={{ width }}>
        {Array.isArray(list) && list.length > 0 ? list.map((item, i) => {
            return <li
                key={i}
                className={`audio-player-list-item ${current === i ? 'current' : ''}`}
                onClick={() => {
                    typeof onSelect === 'function' && onSelect(i, item)
                }}
            >
                {item.ext ? <em>{`${item.ext}`.toUpperCase()}</em> : null}
                <div className="marquee">
                    <span>{item.name}</span>
                </div>
                <Button name="close" color="#000" size={16} backgroundColor="transparent" onTap={() => {
                    typeof onRemove === 'function' && onRemove(i, item)
                }} />
            </li>
        }) : <li className="audio-player-list-item-watermark">drag audio files to here</li>}
    </ul>
}