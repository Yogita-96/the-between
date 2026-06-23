import betweenBg from '../assets/the-between-bg.png'
import './TitleScreen.css'

export default function TitleScreen({ onBegin }) {
  return (
    <div className="title-screen">
      <div
        className="title-bg"
        style={{ backgroundImage: `url(${betweenBg})` }}
      />
      <div className="title-overlay" />

      <div className="title-content">
        <p className="title-eyebrow">A world between worlds</p>

        <h1 className="title-name">The Between</h1>

        <div className="title-divider">
          <div className="title-dash" />
          <div className="title-gem" />
          <div className="title-dash" />
        </div>

        <p className="title-tagline">
          You do not know what you are.<br />
          You know only that you are still here.
        </p>

        <button className="title-btn" onClick={onBegin}>
          Begin
        </button>
      </div>
    </div>
  )
}