import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, HelpCircle, BookOpen, LifeBuoy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreatorSupport() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success('Your message has been sent! We will get back to you soon.');
      setMessage('');
      setEmail('');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="relative">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <LifeBuoy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Creator Support</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">We're here to help you succeed with your blog</p>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="container pb-12">
        <div className="grid md:grid-cols-2 gap-8">

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                Send us a message and we'll get back to you within 24-48 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Your Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Message</label>
                  <Textarea
                    placeholder="How can we help you today? Describe your issue or question..."
                    className="min-h-140px"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Help Resources</CardTitle>
              <CardDescription>Find answers quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Button variant="outline" className="h-auto py-6 justify-start gap-4">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Frequently Asked Questions</div>
                    <div className="text-sm text-muted-foreground">Common questions and answers</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-6 justify-start gap-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Creator Guides</div>
                    <div className="text-sm text-muted-foreground">Step-by-step tutorials</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-6 justify-start gap-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Community Forum</div>
                    <div className="text-sm text-muted-foreground">Ask other creators</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}