import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Video, Lightbulb, Search } from 'lucide-react';

const resources = [
  {
    title: 'How to Grow Your Audience',
    icon: BookOpen,
    desc: 'Tips on SEO, social sharing, and engagement.',
    category: 'Growth',
  },
  {
    title: 'Monetization Best Practices',
    icon: Lightbulb,
    desc: 'Strategies for subscriptions and ads in Nigeria.',
    category: 'Monetization',
  },
  {
    title: 'Content Creation Guide',
    icon: Video,
    desc: 'Video tutorials on writing viral posts.',
    category: 'Content',
  },
];

export default function CreatorEducation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');

  const filteredResources = resources.filter(
    (res) =>
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribe email:', email);
    setEmail('');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Creator Education</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <Card key={res.title}>
            <CardHeader className="flex flex-row items-center gap-3">
              <res.icon className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-lg">{res.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">{res.desc}</p>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {res.category}
              </span>
              <Button variant="link" className="mt-4 p-0 block">
                Read More →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No resources found matching "{searchQuery}"
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Stay Updated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Subscribe to our newsletter for the latest creator tips and resources.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}