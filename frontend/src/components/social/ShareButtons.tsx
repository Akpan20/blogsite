import axios from 'axios';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ShareButtons({ post }) {
    const { data: session } = useSession();
    const [shares, setShares] = useState(0);
  
    const handleShare = async (platform) => {
      try {
        // Record share in database
        await axios.post('/api/social/share', {
          postId: post.id,
          platform,
        });
  
        // Open platform-specific share dialog
        const shareUrl = encodeURIComponent(`${window.location.origin}/post/${post.slug}`);
        const shareText = encodeURIComponent(post.title);
        
        let shareLink = '';
        switch (platform) {
          case 'twitter':
            shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
            break;
          case 'facebook':
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
            break;
          case 'linkedin':
            shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`;
            break;
        }
  
        window.open(shareLink, '_blank', 'width=600,height=400');
        setShares(prev => prev + 1);
      } catch (error) {
        console.error('Error sharing post:', error);
      }
    };
  
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-500"
        >
          <TwitterIcon className="w-5 h-5" />
          Tweet
        </button>
        
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <FacebookIcon className="w-5 h-5" />
          Share
        </button>
        
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2 text-blue-800 hover:text-blue-900"
        >
          <LinkedInIcon className="w-5 h-5" />
          Post
        </button>
      </div>
    );
}
  
  