import React from 'react';

const Logo = ({ className = "" }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                L
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">LinkHub</span>
        </div>
    );
};

export default Logo;
