import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import NatureTemplate from '../components/templates/NatureTemplate';
import { Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const PublicProfile = () => {
    const { username } = useParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [links, setLinks] = useState([]);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 0. Check current user
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setIsLoggedIn(!!currentUser);

                // 1. Get User Profile by Username
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .single();

                if (profileError || !profileData) {
                    throw new Error('User not found');
                }
                setProfile(profileData);

                // Check ownership
                if (currentUser && currentUser.id === profileData.id) {
                    setIsOwner(true);
                }

                // 2. Get User Links
                const { data: linksData, error: linksError } = await supabase
                    .from('links')
                    .select('*')
                    .eq('user_id', profileData.id)
                    .order('position', { ascending: true })
                    .order('created_at', { ascending: true });

                if (linksError) throw linksError;
                setLinks(linksData || []);

            } catch (err) {
                console.error('Error fetching public profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchData();
        }
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">User Not Found</h1>
                <p className="text-slate-500 mb-8">The user @{username} does not exist or has no public profile.</p>
                <a href="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                    Create your own LinkHub
                </a>
            </div>
        );
    }

    // Map Supabase data to component props
    const formattedProfile = {
        name: profile.full_name || `@${profile.username}`,
        bio: profile.website || `Welcome to my LinkHub!`, // Fallback bio
        avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random&size=200`
    };

    return (
        <>
            <SEO
                title={formattedProfile.name}
                description={formattedProfile.bio}
                image={formattedProfile.avatarUrl}
                url={window.location.href}
            />
            <NatureTemplate profileData={formattedProfile} linksData={links} isOwner={isOwner} isLoggedIn={isLoggedIn} />
        </>
    );
};

export default PublicProfile;
