import Link from 'next/link'
import React from 'react'

const OtherAvatarPic = ({imageUrl, otherUserId}: {imageUrl: string, otherUserId: string}) => {
  return (
    <div className='h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 dark:border-dark-outline/40 shadow-sm'>      
      <Link href={`/profile/${otherUserId}`}>
        <img src={imageUrl} alt="profile Picture" className='overflow-hidden object-cover rounded-full'/> 
      </Link>
    </div>
  )
}

export default OtherAvatarPic