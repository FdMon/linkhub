'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Plus, Trash2, ExternalLink, Loader2, Edit2, Smile, ArrowUp, ArrowDown } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Logo from '../../src/components/Logo';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [links, setLinks] = useState([]);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [addingLink, setAddingLink] = useState(false);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const router = useRouter();

    const SOCIAL_PLATFORMS = [
        // General & Social
        "Instagram", "TikTok", "Twitter", "X", "YouTube", "Facebook", "LinkedIn",
        "Pinterest", "Snapchat", "Reddit", "Tumblr", "WhatsApp", "Telegram",
        "Discord", "Twitch", "Threads", "Mastodon", "Clubhouse", "Quora",
        "Medium", "Substack", "Lemon8", "Clapper", "Vero", "MeWe", "Gab",
        "Parler", "Gettr", "Truth Social", "Rumble", "Kick",

        // Creative & Portfolio
        "Behance", "Dribbble", "Flickr", "Vimeo", "DeviantArt", "ArtStation",
        "VSCO", "500px",

        // Music & Audio
        "Spotify", "Apple Music", "SoundCloud", "Bandcamp", "Tidal", "Deezer",
        "Mixcloud", "Audiomack",

        // Funding & Commerce
        "Patreon", "Ko-fi", "Buy Me a Coffee", "Gumroad", "Etsy", "Shopify",
        "Amazon", "Kickstarter", "Indiegogo", "GoFundMe", "Throne", "Wishlist",

        // Link in Bio
        "Linktree", "Carrd", "Beacons", "Stan Store", "Hoo.be",

        // Adult & Exclusive Content
        "OnlyFans", "Fansly", "AdmireMe", "LoyalFans", "Chaturbate", "My.Club",
        "Slushy", "ManyVids", "PocketStars", "Frisk", "JustFor.Fans", "4MyFans",
        "IWantClips", "Clips4Sale", "SextPanther", "Cam4", "Bongacams",
        "Stripchat", "Streamate", "Camsoda", "XHamster", "Pornhub", "XVideos",
        "RedTube", "YouPorn", "Brazzers", "Fancentro", "Fanvue", "Unlockd",
        "Scorp", "Sunroom", "BrandArmy", "Fanhouse", "Passes", "SubscribeStar",
        "AdultTime", "Kink.com", "Wicked", "Vivid", "Hustler", "Penthouse",
        "Playboy", "Evil Angel", "Digital Playground", "BangBros", "Reality Kings",
        "Naughty America",

        // Gaming & Tech
        "Steam", "GitHub", "GitLab", "Stack Overflow", "Product Hunt", "Trovo",
        "DLive", "Odysee"
    ];

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                throw profileError;
            }
            setProfile(profileData);

            const { data: linksData, error: linksError } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', user.id)
                .order('position', { ascending: true })
                .order('created_at', { ascending: true });

            if (linksError) throw linksError;
            setLinks(linksData || []);

        } catch (error) {
            console.error('Error loading data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const detectPlatformFromUrl = (url) => {
        if (!url) return null;
        const lowerUrl = url.toLowerCase();

        // Special cases
        if (lowerUrl.includes('youtu.be') || lowerUrl.includes('youtube.com')) return 'YouTube';
        if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'Twitter';
        if (lowerUrl.includes('t.me')) return 'Telegram';
        if (lowerUrl.includes('wa.me')) return 'WhatsApp';

        // General detection
        for (const platform of SOCIAL_PLATFORMS) {
            if (lowerUrl.includes(platform.toLowerCase().replace(/\s+/g, ''))) {
                return platform;
            }
        }
        return null;
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setNewLinkUrl(url);

        const detected = detectPlatformFromUrl(url);
        if (detected) {
            if (!newLinkTitle) {
                setNewLinkTitle(detected);
            }
        }
    };

    const handleTitleChange = (e) => {
        const value = e.target.value;
        setNewLinkTitle(value);

        if (value.length > 0) {
            const filtered = SOCIAL_PLATFORMS.filter(platform =>
                platform.toLowerCase().startsWith(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
            e.preventDefault();
            selectSuggestion(suggestions[0]);
        }
    };

    const selectSuggestion = (platform) => {
        setNewLinkTitle(platform);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const onEmojiClick = (emojiObject) => {
        setNewLinkTitle(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const addLink = async (e) => {
        e.preventDefault();
        if (!newLinkTitle || !newLinkUrl) return;

        try {
            setAddingLink(true);
            // Get the highest position to append the new link at the end
            const maxPosition = links.length > 0 ? Math.max(...links.map(l => l.position || 0)) : -1;

            const { data, error } = await supabase
                .from('links')
                .insert([
                    {
                        user_id: user.id,
                        title: newLinkTitle,
                        url: newLinkUrl,
                        position: maxPosition + 1
                    }
                ])
                .select();

            if (error) throw error;

            setLinks([...links, data[0]]);
            setNewLinkTitle('');
            setNewLinkUrl('');
            setAddingLink(false); // Close form on success
        } catch (error) {
            console.error('Error adding link:', error.message);
        } finally {
            setLoading(false); // Use general loading state or separate one
        }
    };

    const deleteLink = async (id) => {
        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setLinks(links.filter(link => link.id !== id));
        } catch (error) {
            console.error('Error deleting link:', error.message);
        }
    };

    const moveLink = async (index, direction) => {
        const newLinks = [...links];
        if (direction === 'up' && index > 0) {
            // Swap with previous
            const temp = newLinks[index];
            newLinks[index] = newLinks[index - 1];
            newLinks[index - 1] = temp;
        } else if (direction === 'down' && index < newLinks.length - 1) {
            // Swap with next
            const temp = newLinks[index];
            newLinks[index] = newLinks[index + 1];
            newLinks[index + 1] = temp;
        } else {
            return;
        }

        // Optimistic update
        setLinks(newLinks);

        // Update in Supabase
        try {
            const updates = newLinks.map((link, i) => ({
                id: link.id,
                position: i
            }));

            for (const update of updates) {
                await supabase
                    .from('links')
                    .update({ position: update.position })
                    .eq('id', update.id);
            }
        } catch (error) {
            console.error('Error reordering links:', error);
            // Revert on error (optional, but good practice)
            getProfile();
        }
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) {
                throw updateError;
            }

            setProfile({ ...profile, avatar_url: publicUrl });

        } catch (error) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <Logo />
                <div className="flex items-center gap-4">
                    {profile && (
                        <Link
                            href={`/${profile.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                            <ExternalLink size={16} />
                            View my page
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-indigo-600 text-3xl font-bold">
                                    {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                </span>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" title="Change Avatar">
                            {uploading ? <Loader2 className="animate-spin" /> : <Edit2 size={24} />}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={uploadAvatar}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">@{profile?.username || 'user'}</h1>
                        <p className="text-slate-500">{user?.email}</p>
                    </div>
                </div>

                {/* Add New Link Section */}
                <div className="mb-8">
                    {!addingLink && (
                        <button
                            onClick={() => setAddingLink(true)}
                            className="w-full py-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            Add New Link
                        </button>
                    )}

                    {addingLink && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in fade-in slide-in-from-top-4 duration-200">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Link</h2>
                            <form onSubmit={addLink} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Title (e.g. Instagram)"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                                        value={newLinkTitle}
                                        onChange={handleTitleChange}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => {
                                            if (newLinkTitle) {
                                                const filtered = SOCIAL_PLATFORMS.filter(platform =>
                                                    platform.toLowerCase().startsWith(newLinkTitle.toLowerCase())
                                                );
                                                setSuggestions(filtered);
                                                setShowSuggestions(true);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        <Smile size={20} />
                                    </button>

                                    {showEmojiPicker && (
                                        <div className="absolute z-20 top-full right-0 mt-2 shadow-xl rounded-xl">
                                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                        </div>
                                    )}

                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {suggestions.map((platform, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-slate-700 transition-colors"
                                                    onClick={() => selectSuggestion(platform)}
                                                >
                                                    {platform}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            placeholder="URL (e.g. https://instagram.com/myuser)"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pl-12"
                                            value={newLinkUrl}
                                            onChange={handleUrlChange}
                                            required
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                            {newLinkUrl ? (
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${newLinkUrl}&sz=32`}
                                                    alt="Icon"
                                                    className="w-full h-full object-contain opacity-70"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            ) : (
                                                <ExternalLink size={18} className="text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddingLink(false);
                                            setNewLinkTitle('');
                                            setNewLinkUrl('');
                                        }}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                        Add Link
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Links List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Links</h2>
                    {links.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                            <p>No links yet. Add your first one above!</p>
                        </div>
                    ) : (
                        links.map((link, index) => (
                            <div key={link.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => moveLink(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveLink(index, 'down')}
                                            disabled={index === links.length - 1}
                                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{link.title}</h3>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-indigo-500 truncate block max-w-md">
                                            {link.url}
                                        </a>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteLink(link.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Link"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
