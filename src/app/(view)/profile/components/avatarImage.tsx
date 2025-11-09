'use client'
import React, { useRef } from 'react'
import { UserController } from '../../../(controller)/user/userController';
import { container } from '@/app/lib/diContainer';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface CustomSession {
    user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

const AvatarImage = ({ media, userName }: { media: string[]; userName: string }) => {
    const { data: session } = useSession() as { data: CustomSession | null };
    const loadingIndicator = useRef<HTMLDivElement>(null);
    const errorMessage = useRef<HTMLDivElement>(null);

    const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const userController = container.resolve(UserController);

        if (file) {
            // Hide any previous error message
            if (errorMessage.current) {
                errorMessage.current.style.display = 'none';
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                if (errorMessage.current) {
                    errorMessage.current.textContent = 'File size must be less than 5MB';
                    errorMessage.current.style.display = 'block';
                }
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                if (errorMessage.current) {
                    errorMessage.current.textContent = 'Please select an image file';
                    errorMessage.current.style.display = 'block';
                }
                return;
            }

            try {
                if (!session?.user?.id) {
                    throw new Error('You must be logged in to update your profile picture');
                }

                if (loadingIndicator.current) {
                    loadingIndicator.current.style.display = 'block';
                }
                
                const result = await userController.updateUserProfilePicture(session.user.id, file);
                
                if (!result.success) {
                    throw new Error(result.message || 'Failed to update profile picture');
                }

                // Refresh the page to show the new image
                window.location.reload();
            } catch (error) {
                console.error('Error updating profile picture:', error);
                if (errorMessage.current) {
                    errorMessage.current.textContent = error instanceof Error ? error.message : 'Failed to update profile picture';
                    errorMessage.current.style.display = 'block';
                }
            } finally {
                if (loadingIndicator.current) {
                    loadingIndicator.current.style.display = 'none';
                }
            }
        }
    }

    return (
        <div>
            <div ref={errorMessage} className="hidden text-red-500 text-sm mb-2"></div>
            {media[0] ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500">
                    <div ref={loadingIndicator} className='absolute inset-0 hidden items-center justify-center bg-black bg-opacity-50 text-white z-20'>Loading</div>
                    <input
                        className='absolute inset-0 w-full h-full bg-black opacity-0 hover:opacity-75 transition-opacity cursor-pointer z-10'
                        type='file'
                        accept='image/*'
                        onChange={handleChangeAvatar}
                        title="Upload new profile picture"
                    />
                    <Image
                        src={media[0]}
                        alt={`${userName}'s profile picture`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="relative w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-3xl font-display font-bold text-indigo-600 dark:text-indigo-300 border border-light-outline">
                    <input
                        className='absolute inset-0 w-full h-full bg-black opacity-0 hover:opacity-75 transition-opacity cursor-pointer z-10'
                        type='file'
                        accept='image/*'
                        onChange={handleChangeAvatar}
                        title="Upload profile picture"
                    />
                    {userName?.charAt(0).toUpperCase() || "U"}
                </div>
            )}
        </div>
    );
};

export default AvatarImage