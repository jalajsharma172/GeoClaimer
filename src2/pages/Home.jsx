import React, { useRef, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from '../components/landingPage/navbar/Navbar.jsx'
import LandingPage from '../components/landingPage/LandingPage.jsx'
import DescriptionSection from '../components/landingPage/Details.jsx'
import DevTeam from '../components/landingPage/DevTeam.jsx'

function Home() {
  const descRef = useRef(null)
  const [showNavbar, setShowNavbar] = useState(false)

  useEffect(() => {
    if (!descRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show navbar when the description section is intersecting
          setShowNavbar(entry.isIntersecting)
        })
      },
      { root: null, rootMargin: '0px', threshold: 0.15 }
    )

    observer.observe(descRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div>
      <LandingPage />

      {/* Navbar appears only when DescriptionSection scrolls into view */}
      {showNavbar && <Navbar style={{ position: 'sticky', top: 0, zIndex: 50}} />}

      {/* Attach ref to a wrapper around the description so we can observe it */}
      <div ref={descRef}>
        <DescriptionSection />
        <DevTeam />
      </div>
    </div>
  )
}

export default Home