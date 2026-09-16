import React from 'react';

export default function Badge({ children, variant = 'neutral', size = 'md' }) {
  const styles = {
    published: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    draft: 'bg-amber-50 text-amber-800 border-amber-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
    burgundy: 'bg-[#F3E6D5] text-[#800020] border-[#800020]/20 font-semibold',
    coral: 'bg-[#D45060]/10 text-[#D45060] border-[#D45060]/20 font-semibold',
    neutral: 'bg-[#FFF9F2] text-[#6e5961] border-[rgba(128,0,32,0.1)]'
  };

  const selectedVariant = styles[variant] || styles.neutral;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${padding} ${selectedVariant}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize',
        letterSpacing: '0.02em',
        border: '1px solid rgba(128,0,32,0.15)',
        backgroundColor: variant === 'burgundy' ? '#F3E6D5' : variant === 'active' || variant === 'published' ? '#e6f4ea' : variant === 'pending' || variant === 'draft' ? '#fef7e0' : variant === 'cancelled' ? '#fce8e6' : '#FFF9F2',
        color: variant === 'burgundy' ? '#800020' : variant === 'active' || variant === 'published' ? '#137333' : variant === 'pending' || variant === 'draft' ? '#b06000' : variant === 'cancelled' ? '#c5221f' : '#800020'
      }}
    >
      {children}
    </span>
  );
}
