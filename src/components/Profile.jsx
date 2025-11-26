import React from 'react';

const Profile = ({ name, bio, avatarUrl }) => {
    return (
        <div className="flex flex-col items-center pt-4 pb-8">
            <div className="w-28 h-28 mb-4 rounded-full overflow-hidden shadow-2xl border-2 border-white/80 transition-transform duration-300 hover:scale-105">
                <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-wide drop-shadow-md">{name}</h1>
            <p className="text-white/90 text-center text-sm font-medium max-w-xs leading-relaxed drop-shadow-md">{bio}</p>
        </div>
    );
};

export default Profile;
