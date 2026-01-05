import React from 'react';
import { Balance, Expense, Trip } from '../types';
import { AVATARS } from '../assets/avatars';

interface IndividualBoardProps {
  person: string;
  balances: Balance[];
  expenses: Expense[];
  trip: Trip;
  onClose: () => void;
}

interface PaymentDetail {
  from: string;
  to: string;
  amount: number;
}

const IndividualBoard: React.FC<IndividualBoardProps> = ({ person, balances, expenses, trip, onClose }) => {
  // Find the current person's balance
  const currentBalance = balances.find(b => b.name === person);
  
  // Calculate individual settlements (who this person owes or who owes them)
  const calculateIndividualSettlements = (): PaymentDetail[] => {
    const debtors = balances.filter(b => b.net < 0).map(b => ({ name: b.name, amount: Math.abs(b.net) }));
    const creditors = balances.filter(b => b.net > 0).map(b => ({ name: b.name, amount: b.net }));
    
    const allTransactions: PaymentDetail[] = [];
    
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const settleAmount = Math.min(debtor.amount, creditor.amount);
      
      if (settleAmount > 0.01) {
        allTransactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: settleAmount
        });
      }
      
      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;
      
      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    
    // Filter transactions relevant to this person
    return allTransactions.filter(t => t.from === person || t.to === person);
  };

  const personalTransactions = calculateIndividualSettlements();
  const owesTransactions = personalTransactions.filter(t => t.from === person);
  const receivesTransactions = personalTransactions.filter(t => t.to === person);

  // Calculate expense breakdown for this person
  const personalExpenses = expenses.filter(exp => 
    exp.paidBy === person || exp.splitBetween.includes(person)
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl border-4 border-[#f49221] relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#f49221] to-[#e58515] p-8 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {trip.memberAvatars && trip.memberAvatars[person] ? (
                <img 
                  src={AVATARS.find(a => a.id === trip.memberAvatars![person])?.image || ''} 
                  alt={person}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#f49221] font-bold text-2xl border-4 border-white shadow-lg">
                  {person[0]}
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold text-white">{person}</h2>
                <p className="text-white/80 text-sm">Payment Dashboard</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-white/20 rounded-2xl transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="p-8 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-2xl p-6 border border-blue-700/50">
              <div className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Total Paid</div>
              <div className="text-4xl font-black text-white">₹{currentBalance?.paid.toFixed(2)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-2xl p-6 border border-purple-700/50">
              <div className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Fair Share</div>
              <div className="text-4xl font-black text-white">₹{currentBalance?.owed.toFixed(2)}</div>
            </div>
            <div className={`bg-gradient-to-br ${currentBalance && currentBalance.net < 0 ? 'from-red-900/50 to-red-800/50 border-red-700/50' : currentBalance && currentBalance.net > 0 ? 'from-green-900/50 to-green-800/50 border-green-700/50' : 'from-gray-700/50 to-gray-600/50 border-gray-600/50'} rounded-2xl p-6 border`}>
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${currentBalance && currentBalance.net < 0 ? 'text-red-300' : currentBalance && currentBalance.net > 0 ? 'text-green-300' : 'text-gray-400'}`}>
                {currentBalance && currentBalance.net < 0 ? 'You Owe' : currentBalance && currentBalance.net > 0 ? 'You Get Back' : 'Status'}
              </div>
              <div className={`text-4xl font-black ${currentBalance && currentBalance.net < 0 ? 'text-red-400' : currentBalance && currentBalance.net > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                {currentBalance && Math.abs(currentBalance.net) > 0.01 ? `₹${Math.abs(currentBalance.net).toFixed(2)}` : 'Settled'}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* What you owe */}
          {owesTransactions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                You Should Pay
              </h3>
              <div className="space-y-3">
                {owesTransactions.map((txn, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-red-950/50 to-gray-800/50 rounded-2xl p-5 border-2 border-red-700/50 hover:border-red-500/70 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-500/20 p-3 rounded-xl">
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-3">
                          {trip.memberAvatars && trip.memberAvatars[txn.to] ? (
                            <img 
                              src={AVATARS.find(a => a.id === trip.memberAvatars![txn.to])?.image || ''} 
                              alt={txn.to}
                              className="w-10 h-10 rounded-full object-cover border-2 border-green-500/50"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold border-2 border-green-500/50">
                              {txn.to[0]}
                            </div>
                          )}
                          <div>
                            <div className="text-white font-bold text-lg">Pay {txn.to}</div>
                            <div className="text-red-300 text-xs">Settlement Required</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white font-black px-6 py-3 rounded-xl text-2xl shadow-lg">
                        ₹{txn.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What you'll receive */}
          {receivesTransactions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                You Should Receive
              </h3>
              <div className="space-y-3">
                {receivesTransactions.map((txn, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-green-950/50 to-gray-800/50 rounded-2xl p-5 border-2 border-green-700/50 hover:border-green-500/70 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-500/20 p-3 rounded-xl">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-3">
                          {trip.memberAvatars && trip.memberAvatars[txn.from] ? (
                            <img 
                              src={AVATARS.find(a => a.id === trip.memberAvatars![txn.from])?.image || ''} 
                              alt={txn.from}
                              className="w-10 h-10 rounded-full object-cover border-2 border-red-500/50"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold border-2 border-red-500/50">
                              {txn.from[0]}
                            </div>
                          )}
                          <div>
                            <div className="text-white font-bold text-lg">From {txn.from}</div>
                            <div className="text-green-300 text-xs">Pending Payment</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white font-black px-6 py-3 rounded-xl text-2xl shadow-lg">
                        ₹{txn.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If settled */}
          {owesTransactions.length === 0 && receivesTransactions.length === 0 && (
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl p-8 text-center border-2 border-green-700/50">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">All Settled!</h3>
              <p className="text-green-300 text-sm">You're all balanced. No payments needed.</p>
            </div>
          )}

          {/* Expense breakdown */}
          {personalExpenses.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#f49221] rounded-full"></span>
                Your Expense Activity
              </h3>
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-700">
                  {personalExpenses.slice(0, 10).map((exp, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold">{exp.title}</span>
                            {exp.paidBy === person && (
                              <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded font-bold">You Paid</span>
                            )}
                            {exp.splitBetween.includes(person) && exp.paidBy !== person && (
                              <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded font-bold">You Split</span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {new Date(exp.createdAt).toLocaleDateString()} • Paid by {exp.paidBy}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">₹{exp.amount.toFixed(2)}</div>
                          {exp.splitBetween.includes(person) && (
                            <div className="text-[#f49221] text-xs font-bold">
                              Your share: ₹{(exp.splitType === 'custom' && exp.customSplits && exp.customSplits[person] 
                                ? exp.customSplits[person] 
                                : exp.perPersonAmount).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {personalExpenses.length > 10 && (
                <p className="text-gray-400 text-xs text-center mt-2">Showing 10 of {personalExpenses.length} expenses</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-900/50 rounded-b-3xl border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#f49221] to-[#e58515] hover:from-[#e58515] hover:to-[#f49221] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndividualBoard;
