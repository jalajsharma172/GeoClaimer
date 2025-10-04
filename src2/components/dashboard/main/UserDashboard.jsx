import React from 'react'
import Bg from './Background/Bg.jsx'
import Temp from './Temp.jsx'

function UserDashboard() {
  return (
    <div className="h-full min-h-screen relative text-white font-sans overflow-hidden flex flex-col items-center justify-center">
      {/* Background */}
      {/* <div className="absolute inset-0 z-0 overflow-hidden">
        <Bg />
      </div> */}
      {/* Foreground Content */}
      {/* <div className="relative z-10 w-full h-full "> */}
        <Temp />
      {/* </div> */}
    </div>
  )
}

export default UserDashboard