import React from 'react';

interface CurrencyIconProps {
  amount: number;
  showSign?: boolean;
  className?: string;
}

export const CurrencyIcon: React.FC<CurrencyIconProps> = ({ amount, showSign = false, className = '' }) => {
  const sign = showSign ? (amount >= 0 ? '+' : '-') : '';
  const displayAmount = Math.abs(amount).toFixed(2);
  
  return (
    <span className={className}>
      {sign}<i className="fa fa-inr" style={{ marginRight: '4px' }}></i>{displayAmount}
    </span>
  );
};

export const RupeeSymbol: React.FC<{ className?: string }> = ({ className = '' }) => (
  <i className={`fa fa-inr ${className}`}></i>
);
