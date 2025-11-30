'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';

const AuthContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // Initialize state based on URL query parameter
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        setIsSignUp(searchParams.get('mode') === 'signup');
    }, [searchParams]);

    const [isResetPassword, setIsResetPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            if (isResetPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                setMessage('Check your email for the password reset link!');
            } else if (isSignUp) {
                // 1. Check if username is available
                try {
                    const { data: existingUser, error: checkError } = await supabase
                        .from('profiles')
                        .select('username')
                        .eq('username', username)
                        .single();

                    // Ignore error if it's just "row not found" (which is good)
                    if (checkError && checkError.code !== 'PGRST116') {
                        console.error('Username check error:', checkError);
                        // Don't block signup on security error (RLS issue), let the DB handle it
                        if (checkError.message.includes('SecurityError') || checkError.code === '42501') {
                            console.warn('Skipping username check due to RLS policy. Proceeding to signup.');
                        } else {
                            throw new Error(`Error checking username: ${checkError.message}`);
                        }
                    }
                    if (existingUser) {
                        throw new Error('Username is already taken.');
                    }
                } catch (err) {
                    console.error('Username check exception:', err);
                    if (err.message.includes('relation "public.profiles" does not exist')) {
                        throw new Error('Database setup missing. Please run the SQL script in Supabase.');
                    }
                    // If it's the username taken error, rethrow it
                    if (err.message === 'Username is already taken.') {
                        throw err;
                    }
                    // For other errors (like network or weird RLS), we log and try to proceed
                    console.warn('Proceeding with signup despite check error:', err.message);
                }

                // 2. Sign up user with metadata
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username,
                            full_name: username, // Default full name to username
                        }
                    }
                });
                if (error) throw error;

                // Check if user already exists (Supabase security feature workaround)
                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    setError('This email is already registered. Please sign in instead.');
                    return;
                }

                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2574&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                        {isResetPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Welcome Back')}
                    </h2>
                    <p className="text-slate-500">
                        {isResetPassword
                            ? 'Enter your email to receive a reset link'
                            : (isSignUp ? 'Start building your LinkHub today' : 'Sign in to manage your links')}
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && !isResetPassword && (
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-slate-400 font-semibold text-sm">@</div>
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                required
                                minLength={3}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {!isResetPassword && (
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            isResetPassword ? 'Send Reset Link' : (isSignUp ? 'Sign Up' : 'Sign In')
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    {!isResetPassword && !isSignUp && (
                        <button
                            onClick={() => {
                                setIsResetPassword(true);
                                setMessage('');
                                setError('');
                            }}
                            className="block w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                            Forgot your password?
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (isResetPassword) {
                                setIsResetPassword(false);
                            } else {
                                setIsSignUp(!isSignUp);
                            }
                            setMessage('');
                            setError('');
                        }}
                        className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                        {isResetPassword
                            ? 'Back to Sign In'
                            : (isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up")}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Auth = () => {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <AuthContent />
        </Suspense>
    );
};

export default Auth;
