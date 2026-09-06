import { initials } from '../data/mock'

export default function Avatar({ name, size = 40, muted = false, style }) {
  return (
    <div
      className={`avatar${muted ? ' avatar-muted' : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        ...style,
      }}
    >
      {initials(name)}
    </div>
  )
}
