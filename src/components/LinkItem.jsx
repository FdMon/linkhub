'use client'

import React, { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';

const LinkItem = ({ title, url }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 mb-4 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
        >
            <div className="w-10 h-10 flex items-center justify-center p-1 text-slate-600 group-hover:text-slate-900 transition-colors duration-300">
                {!imageError ? (
                    <img
                        src={`https://www.google.com/s2/favicons?domain=${url}&sz=64`}
                        alt=""
                        className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <LinkIcon size={20} />
                )}
            </div>
            <span className="flex-1 text-center font-medium text-slate-700 group-hover:text-black transition-colors duration-300">
                {title}
            </span>
            {/* Spacer to balance center alignment */}
            <div className="w-10" />
        </a>
    );
};

export default LinkItem;
