import { useEffect, useRef, useState } from 'react'
import './App.css'

const tracks = [
  { title: 'Sohne Mukhre Da', artist: 'Sharry Mann', src: '/audio/Sharry_mann/03 Sohne Mukhre Da - Sharry Mann.mp3', accent: 'gold' },
  { title: 'Disk Ch Kali', artist: 'Sharry Mann', src: '/audio/Sharry_mann/07 Disk Ch Kali - Sharry Mann.mp3', accent: 'pink' },
]

function App() {
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const track = tracks[trackIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }, [])

  const changeTrack = (direction: number) => {
    const nextIndex = (trackIndex + direction + tracks.length) % tracks.length
    setTrackIndex(nextIndex)
    setProgress(0)
    setDuration(0)
    const audio = audioRef.current
    if (audio) {
      audio.src = tracks[nextIndex].src
      audio.load()
      if (isPlaying) void audio.play().catch(() => setIsPlaying(false))
    }
  }

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

  return (
    <main className="station-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <section className="station-content">
        <div className="player-card">
          <div className={`record-art art-${track.accent} ${isPlaying ? 'is-spinning' : ''}`} aria-label="Rotating album artwork">
          </div>
          <div className="track-details">
            <span className="now-playing">Now playing</span>
            <h2>{track.title}</h2>
            <p>{track.artist}</p>
            <div className="progress-wrap">
              <input
                aria-label="Song progress"
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(event) => {
                  const nextProgress = Number(event.target.value)
                  setProgress(nextProgress)
                  if (audioRef.current && duration) audioRef.current.currentTime = (nextProgress / 100) * duration
                }}
              />
              <div className="time-row"><span>{formatTime(audioRef.current?.currentTime ?? 0)}</span><span>{formatTime(duration)}</span></div>
            </div>
          </div>
          <div className="player-controls">
            <button type="button" className="icon-button" onClick={() => changeTrack(-1)} aria-label="Previous track">⏮</button>
            <button type="button" className="play-button" onClick={togglePlayback} aria-label={isPlaying ? 'Pause' : 'Play'}>
              <span className={isPlaying ? 'pause-icon' : 'play-icon'} aria-hidden="true" />
            </button>
            <button type="button" className="icon-button" onClick={() => changeTrack(1)} aria-label="Next track">⏭</button>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={track.src}
          preload="metadata"
          autoPlay
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => {
            const currentTime = event.currentTarget.currentTime
            setProgress(duration ? (currentTime / duration) * 100 : 0)
          }}
          onEnded={() => changeTrack(1)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </section>
    </main>
  )
}

export default App
