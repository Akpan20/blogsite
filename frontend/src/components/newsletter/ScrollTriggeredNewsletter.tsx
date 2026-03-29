import { useState, useEffect } from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Mail, CheckCircle2, Share2, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import NewsletterSubscribe from './NewsletterSubscribe';

export function ScrollTriggeredNewsletter({ postTitle }: { postTitle: string }) {
  const completion = useScrollProgress();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sharing logic
  const shareUrl = window.location.href;
  const encodedTitle = encodeURIComponent(postTitle);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const hiddenInStorage = localStorage.getItem('newsletter_dismissed');
    // Trigger at 70% scroll
    if (completion > 70 && !hasBeenClosed && !hiddenInStorage) {
      setIsVisible(true);
    }
  }, [completion, hasBeenClosed]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenClosed(true);
    // Persist dismissal so it doesn't pop up on every page load
    localStorage.setItem('newsletter_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-in slide-in-from-bottom-8 sm:slide-in-from-right-8 duration-500">
      <Card className="shadow-2xl border-blue-100 dark:border-blue-900 overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="p-6">
          {!isSubscribed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-none">Stay Updated</h3>
                  <p className="text-xs text-gray-500 mt-1">Get weekly tech insights.</p>
                </div>
              </div>
              
              <NewsletterSubscribe 
                onSuccess={() => setIsSubscribed(true)} 
                layout="compact" 
              />

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <Share2 className="h-3 w-3" /> Share this post
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
                    <a href={shareLinks.twitter} target="_blank" rel="noreferrer">
                      <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" /> Twitter
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
                    <a href={shareLinks.linkedin} target="_blank" rel="noreferrer">
                      <Linkedin className="h-4 w-4 mr-2 text-[#0077b5]" /> LinkedIn
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`h-9 w-9 transition-colors ${copied ? 'border-green-500 text-green-500' : ''}`}
                    onClick={copyLink}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">You're subscribed!</h3>
              <p className="text-sm text-gray-500 px-4">Thanks for joining. Feel free to share this post with your network!</p>
              <div className="flex justify-center gap-3 pt-2">
                 <a href={shareLinks.twitter} target="_blank" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:scale-110 transition-transform"><Twitter className="h-4 w-4 text-[#1DA1F2]" /></a>
                 <a href={shareLinks.linkedin} target="_blank" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:scale-110 transition-transform"><Linkedin className="h-4 w-4 text-[#0077b5]" /></a>
              </div>
              <Button variant="ghost" className="mt-4" onClick={handleClose}>Dismiss</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}