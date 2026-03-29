import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowButton } from '@/components/community/FollowButton';
import { BadgeDisplay } from '@/components/community/BadgeDisplay';
import { Calendar, MapPin, Link as LinkIcon, Twitter, Github, Linkedin, Award, Users, FileText, MessageCircle } from 'lucide-react';
import api from '@/lib/api';

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  social: {
    twitter: string | null;
    github: string | null;
    linkedin: string | null;
  };
  stats: {
    reputation_points: number;
    posts_count: number;
    followers_count: number;
    following_count: number;
    comments_count: number;
  };
  badges: any[];
  recent_posts: any[];
  is_online: boolean;
  member_since: string;
  relationship?: {
    is_following: boolean;
    is_followed_by: boolean;
  };
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/users/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            {profile.is_online && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Online
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>
              
              <div className="flex gap-2">
                {profile.relationship && (
                  <FollowButton
                    userId={profile.id}
                    initialIsFollowing={profile.relationship.is_following}
                    onFollowChange={(isFollowing) => {
                      // Update local state
                      setProfile(prev => prev ? {
                        ...prev,
                        stats: {
                          ...prev.stats,
                          followers_count: isFollowing 
                            ? prev.stats.followers_count + 1 
                            : prev.stats.followers_count - 1
                        }
                      } : null);
                    }}
                  />
                )}
                <Link to={`/messages/${profile.username}`}>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </Link>
              </div>
            </div>

            {profile.bio && (
              <p className="text-gray-700 mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.stats.posts_count}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <Link to={`/profile/${profile.id}/followers`} className="text-center hover:text-blue-600">
                <div className="text-2xl font-bold">{profile.stats.followers_count}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </Link>
              <Link to={`/profile/${profile.id}/following`} className="text-center hover:text-blue-600">
                <div className="text-2xl font-bold">{profile.stats.following_count}</div>
                <div className="text-sm text-gray-500">Following</div>
              </Link>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center gap-1">
                  <Award className="h-5 w-5 text-yellow-500" />
                  {profile.stats.reputation_points}
                </div>
                <div className="text-sm text-gray-500">Reputation</div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                  <LinkIcon className="h-4 w-4" />
                  Website
                </a>
              )}
              {profile.social.twitter && (
                <a href={`https://twitter.com/${profile.social.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              )}
              {profile.social.github && (
                <a href={`https://github.com/${profile.social.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {profile.social.linkedin && (
                <a href={`https://linkedin.com/in/${profile.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profile.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <BadgeDisplay badges={profile.badges} />
          </div>
        )}
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="space-y-4">
            {profile.recent_posts.map((post) => (
              <Card key={post.id} className="p-4">
                <Link to={`/content/${post.slug}`}>
                  <h3 className="font-bold text-lg hover:text-blue-600">{post.title}</h3>
                </Link>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <p className="text-gray-500">Activity feed coming soon...</p>
        </TabsContent>

        <TabsContent value="badges">
          <BadgeDisplay badges={profile.badges} detailed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;