export default function Toast({ message }) {
  if (!message) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(84px + env(safe-area-inset-bottom))',
        transform: 'translateX(-50%)',
        background: 'rgba(17, 17, 17, 0.9)',
        color: '#fff',
        padding: '10px 18px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        zIndex: 200,
        maxWidth: 'calc(100% - 32px)',
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
      }}
    >
      {message}
    </div>
  )
}
