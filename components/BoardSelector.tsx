import React from 'react';

interface BoardSelectorProps {
  onSelect: (mode: 'trip' | 'ps') => void;
}

const BoardSelector: React.FC<BoardSelectorProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Trip Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-black p-10 text-center">
          <div className="w-20 h-20 bg-[#f49221] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2 font-pt uppercase tracking-tight">Trip</h2>
          <p className="text-gray-500 mb-8">Track group expenses, balances and settlements.</p>
          <button onClick={() => onSelect('trip')} className="w-full py-5 bg-black text-white rounded-2xl font-bold uppercase tracking-widest">Go</button>
        </div>
        {/* PS Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-[#f49221] p-10 text-center">
          <div className="w-20 h-20 bg-[#f49221] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v4H3V3zm0 6h18v12H3V9zm4 3h5v6H7v-6z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2 font-pt uppercase tracking-tight">Purchase Sheet</h2>
          <p className="text-gray-500 mb-8">Track product serials, orders and delivery status.</p>
          <button onClick={() => onSelect('ps')} className="w-full py-5 bg-[#f49221] text-white rounded-2xl font-bold uppercase tracking-widest">Go</button>
        </div>
      </div>
    </div>
  );
};

export default BoardSelector;
