import React from 'react';
import { FacebookLogo, TwitterLogo, LinkedinLogo, WhatsappLogo, Link as LinkIcon, Check } from '@phosphor-icons/react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const SocialShare = ({ url, title, description }) => {
  const [copied, setCopied] = React.useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareText = description || '';

  const handleShare = (platform) => {
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
    
    // Track share event in GA
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: shareUrl,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy event in GA
      if (window.gtag) {
        window.gtag('event', 'share', {
          method: 'copy_link',
          content_type: 'article',
          item_id: shareUrl,
        });
      }
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex items-center gap-3" data-testid="social-share-buttons">
      <span className="text-sm font-medium text-[#475569]">Share:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="rounded-sm hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
        data-testid="share-facebook"
      >
        <FacebookLogo size={18} weight="fill" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="rounded-sm hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
        data-testid="share-twitter"
      >
        <TwitterLogo size={18} weight="fill" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="rounded-sm hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
        data-testid="share-linkedin"
      >
        <LinkedinLogo size={18} weight="fill" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="rounded-sm hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
        data-testid="share-whatsapp"
      >
        <WhatsappLogo size={18} weight="fill" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="rounded-sm"
        data-testid="copy-link"
      >
        {copied ? <Check size={18} weight="bold" /> : <LinkIcon size={18} weight="bold" />}
      </Button>
    </div>
  );
};

export default SocialShare;