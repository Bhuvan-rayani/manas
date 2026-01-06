import { Expense, Settlement } from '../types';

export interface TransactionSuggestion {
  from: string;
  to: string;
  amount: number;
}

// Builds outstanding payer -> receiver suggestions based on expenses, minus any tracked settlements
export const buildOutstandingTransactions = (
  expenses: Expense[],
  settlements: Settlement[]
): TransactionSuggestion[] => {
  const outstanding = new Map<string, number>();

  // Add what each participant owes directly to the payer of each expense
  expenses.forEach(exp => {
    const payer = exp.paidBy;
    const getShare = (name: string): number => {
      if (exp.splitType === 'custom' && exp.customSplits) {
        return exp.customSplits[name] ?? 0;
      }
      return exp.perPersonAmount;
    };

    exp.splitBetween.forEach(name => {
      if (name === payer) return; // no self-transfer needed
      const share = getShare(name);
      if (share > 0.009) {
        const key = `${name}__${payer}`;
        outstanding.set(key, (outstanding.get(key) || 0) + share);
      }
    });
  });

  // Subtract anything already recorded as a settlement (paid or pending)
  settlements.forEach(settlement => {
    const key = `${settlement.from}__${settlement.to}`;
    if (!outstanding.has(key)) return;
    const remaining = (outstanding.get(key) || 0) - settlement.amount;
    outstanding.set(key, remaining > 0.009 ? remaining : 0);
  });

  return Array.from(outstanding.entries())
    .map(([key, amount]) => {
      const [from, to] = key.split('__');
      return { from, to, amount } as TransactionSuggestion;
    })
    .filter(txn => txn.amount > 0.009)
    .sort((a, b) => b.amount - a.amount);
};
