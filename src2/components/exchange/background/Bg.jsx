import React from 'react'
import DotGrid from '../../../BitsUi/DotGrid';

function Bg() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <DotGrid
            dotSize={5}
            gap={15}
            baseColor="#271E37"
            activeColor="#3729FF"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
        />
    </div>
  )
}

export default Bg