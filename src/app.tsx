import Player from '~/components/player'
import './app.scss'

export default () => {
    return <div className="root-wrapper">
        <Player width={320} />
        <div className="intro">
            <p>
                <em>Audio Player</em>
                <a href="https://github.com/imnull/audio-player">github</a>
                <a href="https://github.com/imnull">author</a>
            </p>
        </div>
    </div>
}