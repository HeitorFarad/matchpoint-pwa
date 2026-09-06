export default function Card({ title, children, style, className = '' }) {
  return (
    <div className={`card ${className}`.trim()} style={style}>
      {title && <p className="card-title">{title}</p>}
      {children}
    </div>
  )
}
