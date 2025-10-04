import React from 'react'
import TopLeft from './panelComponents/TopLeft';
import TopRight from './panelComponents/TopRight';
import BottomLeft from './panelComponents/BottomLeft';
import BottomRight from './panelComponents/BottomRight';

const Panel = ({ children, className = '', title }) => (
    <div className={`w-full min-h-[220px] bg-black-900/50 border border-white/25 rounded-2xl backdrop-blur-sm p-6 shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:border-white/30 transition-all duration-300 ${className}`}>
        {title && <h2 className="text-xl font-semibold text-gray-200 mb-4 ">{title}</h2>}
        <div className="w-full min-h-[120px] h-full flex items-center justify-center text-gray-500">
            {children || <span className="text-sm">Content for {title}</span>}
        </div>
    </div>
);

function Temp() {
  return (
    <div className="w-[90%] md:w-[85%] lg:w-[80%] max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[350px]">
        {/* Item 1: Larger, takes up 2 columns on large screens */}
        <Panel title="Device Analytics" className="lg:col-span-2">
            <TopLeft />
        </Panel>

        {/* Item 2: Standard size */}
        <Panel title="Device Information">
            <TopRight />
        </Panel>

        {/* Item 3: Standard size */}
        <Panel title="Revenue">
            <BottomLeft />
        </Panel>

        {/* Item 4: Larger, takes up 2 columns on large screens */}
        <Panel title="Traffic Sources" className="lg:col-span-2">
            <BottomRight />
        </Panel>
    </div>
  )
}

export default Temp