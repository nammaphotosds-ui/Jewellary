import React from 'react';

const Logo: React.FC<{ className?: string; simple?: boolean }> = ({ className, simple = false }) => {
  return (
    <div className={`flex items-center justify-center text-white ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>
      <div className="ml-3">
        {simple ? (
          <h1 className="text-xl font-bold font-serif tracking-wider text-brand-gold-dark" style={{ textShadow: '0px 1px 1px rgba(0,0,0,0.1)' }}>Devagirikar</h1>
        ) : (
          <h1 className="text-xl font-bold font-serif tracking-wider bg-gradient-to-r from-yellow-300 via-brand-gold to-yellow-600 bg-clip-text text-transparent" style={{ textShadow: '0px 1px 1px rgba(0,0,0,0.2)' }}>Devagirikar</h1>
        )}
        <p className="text-xs text-brand-gold-light -mt-1">JEWELLERS</p>
      </div>
    </div>
  );
};

export default Logo;