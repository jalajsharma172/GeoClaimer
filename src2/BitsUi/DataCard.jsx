import { useRef, useEffect, useMemo, Suspense } from 'react';
import { gsap } from 'gsap';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Loader } from '@react-three/drei';

const RaspberryPiModel = () => {
  const gltf = useGLTF('/raspberry_pi/scene.gltf');
  return <primitive object={gltf.scene} scale={2.5} />;
};

const DataCard = ({ items, className = '', radius = 300, damping = 0.45, fadeOut = 0.6, ease = 'power3.out' }) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  // safe fallback when no items are provided
  const dummyData = [];

  const dataToDisplay = items && items.length > 0 ? items : dummyData;

  const formattedData = useMemo(() => {
    const colors = [
      { borderColor: '#4F46E5', gradient: 'linear-gradient(145deg,#4F46E5,#000)' },
      { borderColor: '#10B981', gradient: 'linear-gradient(210deg,#10B981,#000)' },
      { borderColor: '#F59E0B', gradient: 'linear-gradient(165deg,#F59E0B,#000)' },
      { borderColor: '#EF4444', gradient: 'linear-gradient(195deg,#EF4444,#000)' },
      { borderColor: '#8B5CF6', gradient: 'linear-gradient(225deg,#8B5CF6,#000)' },
      { borderColor: '#06B6D4', gradient: 'linear-gradient(135deg,#06B6D4,#000)' }
    ];

    const truncateAddress = (address) => {
        if (!address || address.length < 10) return 'Invalid Address';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return dataToDisplay.map((item, i) => {
      const stakeInEther = (BigInt(item.stakeAmount || '0') / BigInt(10**18)).toString();
      
      return {
        name: item.name || `Sensor Node #${i + 1}`,
        title: truncateAddress(item.owner || ''),
        subtitle: `Device ID: ${item.deviceId || 'N/A'}`,
        handle: `Stake: ${stakeInEther}`,
        url: item.transactionHash ? `https://etherscan.io/tx/${item.transactionHash}` : '#',
        ...colors[i % colors.length]
      };
    });
  }, [dataToDisplay]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = e => {
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true
    });
  };

  const handleCardClick = url => {
    // if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCardMove = e => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative py-10 w-full h-full flex flex-wrap justify-center items-start gap-6 ${className}`}
      style={{
        '--r': `${radius}px`,
        '--x': '50%',
        '--y': '50%'
      }}
    >
      {formattedData.map((c, i) => (
        <article
          key={i}
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          className="group m-4 relative flex flex-col w-[240px] rounded-[20px] overflow-hidden border-2 border-transparent transition-colors duration-300 cursor-pointer"
          style={{
            '--card-border': c.borderColor,
            background: c.gradient,
            '--spotlight-color': 'rgba(255,255,255,0.3)'
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
            }}
          />
          <div className="h-[180px] bg-black flex items-center justify-center">
            {/* 3D model viewer: uses the public/raspberry_pi/scene.gltf asset */}
            <Suspense fallback={<div className="text-white text-center">Loading 3D Model...</div>}>
              <Canvas style={{ width: '100%', height: '100%' }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[2, 2, 2]} intensity={0.7} />
                <RaspberryPiModel />
                <OrbitControls enablePan={false} />
              </Canvas>
            </Suspense>
          </div>
          <footer className="relative z-10 p-4 text-white font-sans flex flex-col items-center text-center w-full gap-1">
            <h2 className="m-0 text-xl font-bold">{c.name}.eth</h2>
            <h3 className="m-0 text-lg font-semibold opacity-90 ">{c.title}</h3>
            <p className="m-0 text-md opacity-70">{c.subtitle}</p>
            <span className="text-md opacity-80">{c.handle}</span>
          </footer>
        </article>
      ))}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backdropFilter: 'grayscale(1) brightness(0.78)',
          WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
          background: 'rgba(0,0,0,0.001)',
          maskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)',
          WebkitMaskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)'
        }}
      />
      <div
        ref={fadeRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
        style={{
          backdropFilter: 'grayscale(1) brightness(0.78)',
          WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
          background: 'rgba(0,0,0,0.001)',
          maskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
          opacity: 1
        }}
      />
      <Loader /> {/* Optional: shows a loading bar for 3D assets */}
    </div>
  );
};

export default DataCard;