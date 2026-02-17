import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, HelpCircle } from 'lucide-react';

export default function CreatorSupport() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Creator Support</h1>

      <Card>
        <CardHeader>
          <CardTitle>Get Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Need assistance with your blog, monetization, or dashboard? Reach out or check our resources.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button variant="outline" className="h-32 flex flex-col items-center justify-center gap-3">
              <Mail className="h-8 w-8" />
              <span>Email Support</span>
            </Button>
            <Button variant="outline" className="h-32 flex flex-col items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8" />
              <span>FAQ & Guides</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}