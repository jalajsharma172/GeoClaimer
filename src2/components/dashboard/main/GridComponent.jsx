import React from 'react';

import TopLeft from './panelComponents/TopLeft.jsx';
import TopRight from './panelComponents/TopRight.jsx';
import BottomLeft from './panelComponents/BottomLeft.jsx';
import BottomRight from './panelComponents/BottomRight.jsx';

// A reusable panel component for consistent styling
const Panel = ({ children, className = '', title }) => (
    <div className={`bg-gray-900/50 border border-white/20 rounded-2xl backdrop-blur-sm p-6 shadow-lg hover:border-white/30 transition-all duration-300 min-h-[250px] min-w-0 w-full max-w-full h-full max-h-full ${className}`}
         style={{ boxSizing: 'border-box', overflow: 'visible' }}>
        {title && <h2 className="text-lg font-semibold text-gray-200 mb-4">{title}</h2>}
        <div className="w-full h-full flex items-center justify-center text-gray-500 min-w-0 min-h-0">
            {children || <span className="text-sm">Content for {title}</span>}
        </div>
    </div>
);

export function GridComponent() {
  // This grid is designed to be responsive and adapt to different screen sizes.
  // It uses a 12-column grid system for flexibility.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[350px] min-w-0 min-h-0 w-full h-full">
        {/* Item 1: Larger, takes up 2 columns on large screens */}
        <Panel title="Key Performance Indicators" className="lg:col-span-2">
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
  );
}

// A component to create the background grid pattern
export const GridBackground = () => (
    <div className="absolute inset-0 z-[-1] h-full w-full bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
);