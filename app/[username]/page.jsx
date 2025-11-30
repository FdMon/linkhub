import { supabase } from '../../lib/supabase';
import NatureTemplate from '../../src/components/templates/NatureTemplate';
import { notFound } from 'next/navigation';

// Force dynamic rendering since content depends on the username
export const dynamic = 'force-dynamic';

async function getProfile(username) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    return profile;
}

async function getLinks(userId) {
    const { data: links } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

    return links || [];
}

export async function generateMetadata({ params }) {
    const profile = await getProfile(params.username);

    if (!profile) {
        return {
            title: 'User Not Found',
        };
    }

    const title = profile.full_name || `@${profile.username}`;
    const description = profile.website || `Check out ${title}'s links on LinkHub.`;
    const image = profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random&size=200`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [
                {
                    url: image,
                    width: 400,
                    height: 400,
                    alt: title,
                }
            ],
            type: 'profile',
            username: profile.username,
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [image],
        },
    };
}

export default async function ProfilePage({ params }) {
    const profile = await getProfile(params.username);

    if (!profile) {
        notFound();
    }

    const links = await getLinks(profile.id);

    // Map Supabase data to component props format
    const formattedProfile = {
        name: profile.full_name || `@${profile.username}`,
        bio: profile.website || `Welcome to my LinkHub!`,
        avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random&size=200`
    };

    // Note: We're not passing isOwner/isLoggedIn yet as that requires client-side auth check
    // For public view, these default to false which is correct
    return (
        <NatureTemplate
            profileData={formattedProfile}
            linksData={links}
            isOwner={false}
            isLoggedIn={false}
        />
    );
}
