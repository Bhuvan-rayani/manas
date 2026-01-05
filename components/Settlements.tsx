import React, { useMemo, useState } from 'react';
import { Balance, Settlement, Trip } from '../types';
import { AVATARS } from '../assets/avatars';
import { createSettlement, deleteSettlement, setSettlementPaidStatus } from '../services/db';

interface SettlementsProps {
  balances: Balance[];
  tripId: string;
  trackedSettlements: Settlement[];
  participants: string[];
  trip?: Trip;
}

interface TransactionSuggestion {
  from: string;
  to: string;
  amount: number;
}

const Settlements: React.FC<SettlementsProps> = ({ balances, tripId, trackedSettlements, participants, trip }) => {
  const [creatingSettlement, setCreatingSettlement] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [submittingCustom, setSubmittingCustom] = useState(false);
  const [togglingPaid, setTogglingPaid] = useState<string | null>(null);

  // Compute minimal suggested transactions between debtors and creditors
  const suggestedSettlements = useMemo(() => {
    const debtors = balances.filter(b => b.net < 0).map(b => ({ name: b.name, amount: Math.abs(b.net) }));
    const creditors = balances.filter(b => b.net > 0).map(b => ({ name: b.name, amount: b.net }));
    const txns: TransactionSuggestion[] = [];

    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0.01) {
        txns.push({ from: debtor.name, to: creditor.name, amount });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;
      if (debtor.amount < 0.01) i += 1;
      if (creditor.amount < 0.01) j += 1;
    }

    return txns;
  }, [balances]);

  const unpaidSettlements = trackedSettlements.filter(s => !s.isPaid);
  const paidSettlements = trackedSettlements.filter(s => s.isPaid);

  const renderAvatar = (name: string) => {
    const avatarId = trip?.memberAvatars?.[name];
    const avatar = AVATARS.find(a => a.id === avatarId);
    if (avatar?.image) {
      return <img src={avatar.image} alt={name} className="w-10 h-10 rounded-lg object-cover" />;
    }
    return (
      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
        {name[0]}
      </div>
    );
  };

  const handleCreateSettlement = async (txn: TransactionSuggestion) => {
    const key = `${txn.from}-${txn.to}`;
    setCreatingSettlement(key);
    try {
      await createSettlement(tripId, txn.from, txn.to, txn.amount);
    } catch (err) {
      console.error('Error creating settlement', err);
      alert('Failed to track this payment.');
    } finally {
      setCreatingSettlement(null);
    }
  };

  const handleTogglePaid = async (settlementId: string, nextPaid: boolean) => {
    setTogglingPaid(settlementId);
    try {
      await setSettlementPaidStatus(settlementId, nextPaid);
    } catch (err) {
      console.error('Error updating paid status', err);
      alert('Failed to update status.');
    } finally {
      setTogglingPaid(null);
    }
  };

  const handleMoveToSuggested = async (settlementId: string) => {
    try {
      await deleteSettlement(settlementId);
    } catch (err) {
      console.error('Error moving payment back to suggested', err);
      alert('Failed to move payment back.');
    }
  };

  const handleCustomSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (!customFrom || !customTo || Number.isNaN(amount) || amount <= 0) {
      alert('Please fill all fields with a valid amount.');
      return;
    }
    if (customFrom === customTo) {
      alert('Payer and receiver cannot be the same.');
      return;
    }

    setSubmittingCustom(true);
    try {
      await createSettlement(tripId, customFrom, customTo, amount);
      setShowCustomForm(false);
      setCustomFrom('');
      setCustomTo('');
      setCustomAmount('');
    } catch (err) {
      console.error('Error creating custom settlement', err);
      alert('Failed to record payment.');
    } finally {
      setSubmittingCustom(false);
    }
  };

  const nothingToShow = suggestedSettlements.length === 0 && unpaidSettlements.length === 0 && paidSettlements.length === 0;

  if (nothingToShow) {
    return (
      <div className="mt-8 bg-gradient-to-br from-green-900 to-green-950 rounded-3xl p-8 text-center border-2 border-green-700">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-white font-bold text-xl mb-2">All Settled!</h3>
        <p className="text-green-300 text-sm">Everyone is balanced. No payments needed.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-2xl font-bold">Settlements</h3>
        <button
          onClick={() => setShowCustomForm(v => !v)}
          className="bg-[#f49221] hover:bg-[#e58515] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
          </svg>
          Record Payment
        </button>
      </div>

      {showCustomForm && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-[#f49221] rounded-2xl p-6 shadow-2xl shadow-[#f49221]/20">
          <h4 className="text-white font-bold text-lg mb-4">Record a Payment</h4>
          <form onSubmit={handleCustomSettlement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-sm font-medium mb-2 block">Who Paid</label>
                <select
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#f49221] outline-none"
                  required
                >
                  <option value="">Select person</option>
                  {participants.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium mb-2 block">Paid To</label>
                <select
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#f49221] outline-none"
                  required
                >
                  <option value="">Select person</option>
                  {participants.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium mb-2 block">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#f49221] outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submittingCustom}
                className="bg-[#f49221] hover:bg-[#e58515] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex-1"
              >
                {submittingCustom ? 'Saving...' : 'Save Payment'}
              </button>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {unpaidSettlements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xl font-bold">Tracked Payments</h3>
            <span className="bg-red-900 text-red-200 text-xs font-bold px-3 py-1 rounded-full">
              {unpaidSettlements.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {unpaidSettlements.map(settlement => (
              <div key={settlement.id} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 border-2 border-red-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {renderAvatar(settlement.from)}
                    <div className="flex-1">
                      <div className="text-white font-bold">{settlement.from}</div>
                      <div className="text-red-300 text-xs">should pay</div>
                    </div>
                  </div>

                  <div className="px-6">
                    <svg className="w-8 h-8 text-[#f49221]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 text-right">
                      <div className="text-white font-bold">{settlement.to}</div>
                      <div className="text-red-300 text-xs">receives</div>
                    </div>
                    {renderAvatar(settlement.to)}
                  </div>

                  <div className="ml-6 flex items-center gap-3">
                    <div className="bg-[#f49221] text-white font-bold px-4 py-2 rounded-xl text-lg">
                      ₹{settlement.amount.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePaid(settlement.id, true)}
                        disabled={togglingPaid === settlement.id}
                        className="w-24 h-9 rounded-full flex items-center px-1 transition-all bg-red-700 text-white text-xs font-bold justify-between"
                        title="Mark as paid"
                      >
                        <span className="ml-2">Unpaid</span>
                        <span className="w-6 h-6 bg-white rounded-full shadow" />
                      </button>
                      <button
                        onClick={() => handleMoveToSuggested(settlement.id)}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                        title="Move back to suggested"
                      >
                        Move to Suggested
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestedSettlements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xl font-bold">Suggested Settlements</h3>
            <span className="bg-[#f49221] text-white text-xs font-bold px-3 py-1 rounded-full">
              {suggestedSettlements.length} Suggested
            </span>
          </div>

          <div className="space-y-3">
            {suggestedSettlements.map((txn, idx) => {
              const key = `${txn.from}-${txn.to}`;
              const alreadyTracked = unpaidSettlements.some(s => s.from === txn.from && s.to === txn.to && Math.abs(s.amount - txn.amount) < 0.01);
              if (alreadyTracked) return null;

              return (
                <div key={key || idx} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 border-2 border-[#f49221]/30 hover:border-[#f49221] transition-all hover:shadow-xl hover:shadow-[#f49221]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {renderAvatar(txn.from)}
                      <div className="flex-1">
                        <div className="text-white font-bold">{txn.from}</div>
                        <div className="text-gray-400 text-xs">should pay</div>
                      </div>
                    </div>

                    <div className="px-6">
                      <svg className="w-8 h-8 text-[#f49221]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1 text-right">
                        <div className="text-white font-bold">{txn.to}</div>
                        <div className="text-gray-400 text-xs">receives</div>
                      </div>
                      {renderAvatar(txn.to)}
                    </div>

                    <div className="ml-6 flex items-center gap-3">
                      <div className="bg-[#f49221] text-white font-bold px-4 py-2 rounded-xl text-lg">
                        ₹{txn.amount.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleCreateSettlement(txn)}
                        disabled={creatingSettlement === key}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                        title="Track this payment"
                      >
                        {creatingSettlement === key ? 'Adding...' : 'Track'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {paidSettlements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xl font-bold">Completed Payments</h3>
            <span className="bg-green-900 text-green-300 text-xs font-bold px-3 py-1 rounded-full">
              {paidSettlements.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {paidSettlements.map(settlement => (
              <div key={settlement.id} className="bg-gradient-to-r from-green-950 to-green-900 rounded-2xl p-5 border-2 border-green-800 opacity-80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {renderAvatar(settlement.from)}
                    <div className="flex-1">
                      <div className="text-white font-bold">{settlement.from}</div>
                      <div className="text-green-300 text-xs">paid</div>
                    </div>
                  </div>

                  <div className="px-6">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 text-right">
                      <div className="text-white font-bold">{settlement.to}</div>
                      <div className="text-green-300 text-xs">received</div>
                    </div>
                    {renderAvatar(settlement.to)}
                  </div>

                  <div className="ml-6 flex items-center gap-3">
                    <div className="bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-lg">
                      ₹{settlement.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleTogglePaid(settlement.id, false)}
                      disabled={togglingPaid === settlement.id}
                      className="w-24 h-9 rounded-full flex items-center px-1 transition-all bg-green-700 text-white text-xs font-bold justify-between"
                      title="Mark as unpaid"
                    >
                      <span className="ml-2">Paid</span>
                      <span className="w-6 h-6 bg-white rounded-full shadow" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settlements;