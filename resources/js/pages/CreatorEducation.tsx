import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Video, Lightbulb, BarChart3, Share2, Users } from 'lucide-react';

const resources = [
  {
    icon: BookOpen,
    title: "Content Creation Mastery",
    description: "Learn how to write posts that people love to read and share",
    color: "text-blue-600",
  },
  {
    icon: Video,
    title: "Video & Visual Content",
    description: "How to create engaging visuals and short videos for your blog",
    color: "text-red-600",
  },
  {
    icon: Lightbulb,
    title: "Idea Generation & Brainstorming",
    description: "Never run out of post ideas again with proven systems",
    color: "text-yellow-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Growth Hacking",
    description: "Understand your audience and grow faster with data",
    color: "text-green-600",
  },
  {
    icon: Share2,
    title: "Traffic & Distribution Strategies",
    description: "Get your content in front of more people ethically",
    color: "text-purple-600",
  },
  {
    icon: Users,
    title: "Building a Loyal Audience",
    description: "Turn readers into subscribers and superfans",
    color: "text-pink-600",
  },
];

export default function CreatorEducation() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Creator Education</h1>
        <p className="text-muted-foreground mt-2">
          Resources to help you build a successful blog and creator business
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <resource.icon className={`h-8 w-8 ${resource.color}`} />
                <CardTitle className="text-xl">{resource.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {resource.description}
              </CardDescription>
              <Button variant="link" className="mt-4 px-0">
                Start Learning →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-none">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to take your blog to the next level?</CardTitle>
          <CardDescription className="text-lg">
            Join our weekly creator newsletter for exclusive tips, case studies, and early access to new features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md">
            <Input placeholder="your@email.com" type="email" />
            <Button>Subscribe</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}