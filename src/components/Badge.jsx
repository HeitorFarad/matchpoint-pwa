export default function Badge({ color = 'green', children, icon }) {
  return (
    <span className={`badge badge-${color}`}>
      {icon}
      {children}
    </span>
  )
}
