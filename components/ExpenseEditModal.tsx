import React, { useState } from 'react';
import { PaymentMethod, SplitType, Expense, Trip } from '../types';
import { updateExpenseItem } from '../services/db';
import { AVATARS } from '../assets/avatars';
import { RupeeSymbol } from './CurrencyIcon';

interface ExpenseEditModalProps {
  expense: Expense;
  participants: string[];
  trip?: Trip;
  onClose: () => void;
  onUpdate: () => void;
}

const ExpenseEditModal: React.FC<ExpenseEditModalProps> = ({ expense, participants, trip, onClose, onUpdate }) => {
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [paidBy, setPaidBy] = useState(expense.paidBy);
  const [splitBetween, setSplitBetween] = useState<string[]>(expense.splitBetween);
  const [splitType, setSplitType] = useState<SplitType>(expense.splitType || 'fair');
  const [customAmounts, setCustomAmounts] = useState<{ [name: string]: string }>(
    expense.customSplits ? Object.fromEntries(Object.entries(expense.customSplits).map(([k, v]) => [k, v.toString()])) : {}
  );
  const [method, setMethod] = useState<PaymentMethod>(expense.paymentMethod);
  const [loading, setLoading] = useState(false);

  const renderAvatar = (name: string, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-5 h-5 text-[8px]' : 'w-6 h-6 text-[10px]';
    const borderClass = size === 'sm' ? 'border' : 'border-2';
    
    if (trip?.memberAvatars?.[name]) {
      const avatar = AVATARS.find(a => a.id === trip.memberAvatars[name]);
      if (avatar) {
        return (
          <img 
            src={avatar.image} 
            alt={name} 
            className={`${sizeClass} rounded-full object-cover ${borderClass} border-white flex-shrink-0`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      }
    }
    
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className={`${sizeClass} rounded-full bg-[#f49221]/20 flex items-center justify-center font-bold text-[#f49221] flex-shrink-0`}>
        {initials}
      </div>
    );
  };

  const perPerson = splitType === 'custom' ? 0 : parseFloat(amount) / splitBetween.length || 0;

  const handleSplitBetweenChange = (person: string, checked: boolean) => {
    if (checked) {
      setSplitBetween([...splitBetween, person]);
    } else {
      setSplitBetween(splitBetween.filter(p => p !== person));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !paidBy || splitBetween.length === 0) {
      return alert("Please fill all required fields.");
    }

    setLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      const updateData: any = {
        title,
        amount: parsedAmount,
        paidBy,
        splitBetween,
        perPersonAmount: perPerson,
        splitType,
        paymentMethod: method
      };

      if (splitType === 'custom') {
        updateData.customSplits = Object.fromEntries(
          Object.entries(customAmounts).map(([k, v]) => [k, parseFloat(v as string) || 0])
        );
      }

      await updateExpenseItem(expense.id, updateData);
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating expense:", err);
      alert("Failed to update expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 border-4 border-[#f49221]">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-black font-pt uppercase tracking-tight">Edit Expense</h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Expense Item</label>
              <input 
                type="text" 
                placeholder="e.g. Flight Tickets" 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Amount (₹)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Who Paid?</label>
              <select 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none bg-white font-bold text-black" 
                value={paidBy} 
                onChange={e => setPaidBy(e.target.value)}
              >
                <option value="">Select Member</option>
                {participants.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Payment Channel</label>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                {(['UPI', 'Cash'] as PaymentMethod[]).map(m => (
                  <button 
                    key={m} 
                    type="button" 
                    onClick={() => setMethod(m)} 
                    className={`flex-1 py-3 text-xs rounded-xl font-bold transition-all uppercase tracking-widest ${method === m ? 'bg-white shadow-xl text-[#f49221]' : 'text-gray-400'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block ml-1">Split Between:</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {participants.map(person => (
                <label key={person} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                  <input 
                    type="checkbox" 
                    checked={splitBetween.includes(person)}
                    onChange={e => handleSplitBetweenChange(person, e.target.checked)}
                    className="w-5 h-5 rounded accent-[#f49221]"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {renderAvatar(person, 'sm')}
                    <span className="font-bold text-black">{person}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#f49221] to-[#e58515] hover:shadow-lg hover:shadow-[#f49221]/50 text-white py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseEditModal;
