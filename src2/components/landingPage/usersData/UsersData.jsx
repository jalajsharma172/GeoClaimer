import React from 'react'
import DataCard from '../../../BitsUi/DataCard.jsx'
import items from '../../../DummyData/DummyUserData.json'
import DotGrid from '../../DotGrid.jsx'

function UsersData() {
    return (
        <div className='min-h-screen min-w-screen bg-black flex justify-center items-center relative'>
            {/* DotGrid background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
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
            {/* Top-left subtle gradient overlay on black background */}
            <div
                aria-hidden
                className='absolute inset-0 pointer-events-none'
                style={{
                    background: 'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.06) 20%, transparent 40%)'
                }}
            />
            <DataCard
                items={items}
                radius={300}
                damping={0.45}
                fadeOut={0.6}
                ease="power3.out"
            />
        </div>
    )
}

export default UsersData