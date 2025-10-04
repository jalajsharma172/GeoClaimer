import React from 'react'

function EchonetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="url(#grad1)"/>
        <path d="m13.89 8.11-4.08 4.08 4.08 4.08 1.41-1.41-2.67-2.67 2.67-2.67-1.41-1.41z" fill="url(#grad2)"/>
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#6366f1', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#a855f7', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#ec4899', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#f43f5e', stopOpacity:1}} />
            </linearGradient>
        </defs>
    </svg>
  )
}

export default EchonetIcon