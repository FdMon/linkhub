'use client'

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Layers, Zap } from 'lucide-react';
import Logo from '../src/components/Logo';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <Logo />
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium">
                        Log in
                    </Link>
                    <Link
                        href="/login?mode=signup"
                        className="px-4 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
                    >
                        Sign up free
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="px-6 pt-16 pb-24 text-center max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
                    Everything you are. <br />
                    <span className="text-indigo-600">In one simple link.</span>
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join 50M+ people using LinkHub for their link in bio. One link to help you share everything you create, curate and sell from your Instagram, TikTok, Twitter, YouTube and other social media profiles.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="relative w-full max-w-xs">
                        <span className="absolute left-4 top-3.5 text-slate-400 font-medium">linkhub.to/</span>
                        <input
                            type="text"
                            placeholder="yourname"
                            className="w-full pl-24 pr-4 py-3.5 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <Link
                        href="/login?mode=signup"
                        className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                    >
                        Claim your LinkHub <ArrowRight size={18} />
                    </Link>
                </div>
            </header>

            {/* Feature Grid */}
            <section className="bg-white py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
                    <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors duration-300">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Layers size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Beautiful Themes</h3>
                        <p className="text-slate-600">Choose from dozens of professionally designed themes or create your own.</p>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors duration-300">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Instant Updates</h3>
                        <p className="text-slate-600">Add links, update your bio, and change your look in seconds.</p>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors duration-300">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Analytics Included</h3>
                        <p className="text-slate-600">Track your views and clicks to understand your audience better.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-center">
                <p>&copy; 2024 LinkHub. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
