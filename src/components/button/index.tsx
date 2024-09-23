import SvgIcon, { TIconNames } from '~/components/svg-icon'
import './index.scss'

export default (props: {
    name?: TIconNames;
    disabled?: boolean;
    color?: string;
    disabledColor?: string;
    backgroundColor?: string;
    size?: number;
    iconRate?: number;
    onTap?: () => void;
}) => {
    const {
        name = 'play',
        disabled = false,
        color = '#222',
        disabledColor = '#aaa',
        backgroundColor = '#fff',
        size = 24,
        iconRate = 0.75,
        onTap,
    } = props
    return <div
        className={`audio-player-button ${disabled ? 'audio-player-button-disabled' : ''}`}
        style={{ width: size, height: size, backgroundColor }}
        onClick={() => {
            typeof onTap === 'function' && onTap()
        }}
    >
        <SvgIcon size={size * iconRate} name={name} fillStyle={disabled ? disabledColor : color} />
    </div>
}