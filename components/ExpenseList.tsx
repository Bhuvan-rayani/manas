
import React, { useState } from 'react';
import { Expense, Trip } from '../types';
import { AVATARS } from '../assets/avatars';
import { RupeeSymbol } from './CurrencyIcon';

interface ExpenseListProps {
  expenses: Expense[];
  trip?: Trip;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, trip }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderAvatar = (name: string) => {
    const avatarId = trip?.memberAvatars?.[name];
    const avatar = AVATARS.find(a => a.id === avatarId);
    if (avatar?.image) {
      return <img src={avatar.image} alt={name} className="w-6 h-6 rounded-full object-cover" />;
    }
    return (
      <div className="w-6 h-6 bg-[#f49221]/30 rounded-full flex items-center justify-center text-[#f49221] font-bold text-xs">
        {name[0]}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl overflow-hidden shadow-2xl shadow-[#f49221]/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-[#f49221] to-[#e58515] text-white backdrop-blur-xl">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Description</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Value</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Paid By</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Split</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-white/10 transition-all border-l-4 border-transparent hover:border-[#f49221] backdrop-blur-sm group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-white text-base">{exp.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(exp.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-5 font-bold text-lg text-white"><RupeeSymbol className="mr-1" />{exp.amount.toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {renderAvatar(exp.paidBy)}
                      <div>
                        <div className="text-gray-300 font-medium">{exp.paidBy}</div>
                        <div className="text-xs text-gray-600">({exp.paymentMethod})</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-gray-300 font-medium text-sm">{exp.splitBetween.length} person{exp.splitBetween.length !== 1 ? 's' : ''}</div>
                    {exp.splitType === 'custom' ? (
                      <div className="text-xs text-purple-400 font-bold mt-1">CUSTOM SPLIT</div>
                    ) : (
                      <div className="text-xs text-[#f49221] font-bold mt-1"><RupeeSymbol />{exp.perPersonAmount.toFixed(2)} each</div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {exp.proofImageUrl ? (
                      <button 
                        onClick={() => setSelectedImage(exp.proofImageUrl!)}
                        className="bg-[#f49221] hover:bg-[#e58515] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-gray-600 text-xs">No proof</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-[60] backdrop-blur-xl" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button className="absolute -top-16 right-0 text-white hover:text-[#f49221] transition-colors p-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={selectedImage} alt="Payment Proof" className="max-h-[80vh] object-contain rounded-3xl shadow-[0_0_100px_rgba(244,146,33,0.3)] border-4 border-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
