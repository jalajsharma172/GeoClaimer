import React from 'react';
import Orb from '../../BitsUi/Orb';
import { Link } from 'react-router-dom';
import ShinyText from '../../BitsUi/ShinyText.jsx';

function LandingPage() {
    return (
        <div className='relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden p-4'>
            <div className='absolute inset-0 z-0 flex items-center justify-center'>
                <Orb
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    hue={0}
                    forceHoverState={false}
                />
            </div>

            <div className='relative z-10 flex flex-col items-center text-center space-y-6'>
                {/* <h1 className='text-5xl md:text-7xl font-bold text-white leading-tight'>
                Map Your World in Sound.
                <br />
                Get Rewarded.
            </h1> */}

                <ShinyText
                    text="Map Your World in Sound"
                    disabled={false}
                    speed={3}
                    className='custom-class'
                />

                {/* <br /> */}

                <ShinyText
                    text="Get Rewarded."
                    disabled={false}
                    speed={3}
                    className='custom-class'
                />

                <p className='text-lg md:text-xl text-white/90 max-w-3xl'>
                    Deploy a sensor, join the EchoNet DePIN on Solana, and start earning $ECHO by contributing to a global soundscape map.
                </p>

                <div className='flex items-center gap-4 pt-4'>
                    <Link
                        to="/dashboard"
                        className='bg-white cursor-pointer text-black font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all'
                    >
                        Get Started
                    </Link>
                    <button className='bg-white/10 cursor-pointer text-white font-semibold py-3 px-8 rounded-full border border-white/20 hover:bg-white/20 transition-all'>
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LandingPage;