import React from 'react'

const ExchangeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

function BottomLeft() {
  const exchangeData = {
    totalUsdcExchanged: 250135.75,
    totalTransactions: 1842,
    avgTransactionSize: 135.80,
    volume24h: 12560.30,
  };

  // A reusable component for displaying each individual stat.
  const StatRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-8 text-center">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-semibold text-white tracking-wider">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col space-y-5">
      <StatRow
        icon={<ExchangeIcon />}
        label="Total USDC Exchanged"
        value={`$${exchangeData.totalUsdcExchanged.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
      <StatRow
        icon={<ClipboardListIcon />}
        label="Total Transactions"
        value={exchangeData.totalTransactions.toLocaleString()}
      />
      <StatRow
        icon={<ChartBarIcon />}
        label="Average Transaction"
        value={`$${exchangeData.avgTransactionSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
      <StatRow
        icon={<ClockIcon />}
        label="Volume (24h)"
        value={`$${exchangeData.volume24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
    </div>
  );
}

export default BottomLeft