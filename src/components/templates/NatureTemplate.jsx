import React from 'react';
import Profile from '../Profile';
import LinkList from '../LinkList';
import { Edit2 } from 'lucide-react';
import Logo from '../Logo';

const NatureTemplate = ({ profileData, linksData, isOwner, isLoggedIn }) => {
    return (
        <div
            className="min-h-screen flex flex-col items-center py-8 px-4 bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2574&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* Navigation Controls */}
            <div className="absolute top-4 left-4 z-20">
                <a href={isLoggedIn ? "/dashboard" : "/"} className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors flex items-center justify-center shadow-lg" title={isLoggedIn ? "Go to Dashboard" : "Go Home"}>
                    <Logo />
                </a>
            </div>

            {isOwner && (
                <div className="absolute top-4 right-4 z-20">
                    <a href="/dashboard" className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-slate-800 font-semibold hover:bg-white transition-colors flex items-center gap-2 shadow-lg">
                        <Edit2 size={16} />
                        Edit Profile
                    </a>
                </div>
            )}

            <div className="w-full max-w-md z-10 mt-8">
                <Profile {...profileData} />
                <LinkList links={linksData} />
            </div>

            {/* Branding Footer */}
            <div className="mt-auto pt-8 z-10">
                <a href="/" className="text-white/60 text-sm font-medium hover:text-white transition-colors">
                    LinkHub
                </a>
            </div>
        </div>
    );
};

export default NatureTemplate;
