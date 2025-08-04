'use client'
import React, { useRef } from 'react'
import { UserController } from '../../../(controller)/user/userController';
import { container } from '@/app/lib/diContainer';
import { useSession } from 'next-auth/react';

const AvatarImage = ({ media, userName }: { media: string[]; userName: string }) => {
    const { data: session } = useSession();
    const loadingIndicator = useRef<HTMLDivElement>(null);
    const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const userController = container.resolve(UserController);

        if (file) {
            if (loadingIndicator.current) {
                loadingIndicator.current.style.display = 'block'; // Show loading indicator
            }
            const result = await userController.updateUserProfilePicture(session?.user?.id, file);
            if (loadingIndicator.current) {
                loadingIndicator.current.style.display = 'none'; // Hide loading indicator
            }
            console.log(result);
        }
    }

    return (
        <div>
            {media[0] ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500">
                   <div ref={loadingIndicator} className='absolute inset-0 hidden items-center justify-center bg-black bg-opacity-50 text-white '>Loading</div>
                   <input className='absolute inset-0 w-full h-full bg-black opacity-0 hover:opacity-75 transition-opacity' type='file' accept='image/*' onChange={handleChangeAvatar}>
                       
                   </input>
                    <img
                        src={media[0]}
                        alt={`${userName}'s profile picture`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-3xl font-display font-bold text-indigo-600 dark:text-indigo-300 border border-light-outline">
                    <button className='absolute inset-0 w-full h-full bg-black opacity-0 hover:opacity-75 transition-opacity' onClick={handleChangeAvatar}>
                       <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                       </svg>
                   </button>
                    {userName?.charAt(0).toUpperCase() || "U"}
                </div>
            )}
        </div>
    );
};

export default AvatarImage