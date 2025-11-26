import React from 'react';
import LinkItem from './LinkItem';

const LinkList = ({ links }) => {
    return (
        <div className="w-full max-w-md mx-auto mt-6 px-4">
            {links.map((link) => (
                <LinkItem key={link.id} {...link} />
            ))}
        </div>
    );
};

export default LinkList;
