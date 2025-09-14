import Link from 'next/link'
import React from 'react'


const OtherAvatarPic = ({imageUrl, otherUserId, userName}: {imageUrl?: string, otherUserId: string, userName?: string}) => {
  const showFallback = !imageUrl;
  return (
    <div className='h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 dark:border-dark-outline/40 shadow-sm flex items-center justify-center bg-primary/10'>
      <Link href={`/profile/${otherUserId}`}> 
        {showFallback ? (
          <span className="w-full h-full flex items-center justify-center text-primary font-display font-medium text-title-lg bg-primary/10">
            {userName?.charAt(0)?.toUpperCase() || <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          </span>
        ) : (
          <img src={imageUrl} alt="profile Picture" className='overflow-hidden object-cover rounded-full w-full h-full'/>
        )}
      </Link>
    </div>
  )
}

export default OtherAvatarPic