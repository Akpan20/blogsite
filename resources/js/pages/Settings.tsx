import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'New password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

const notificationsSchema = z.object({
  email_notifications: z.boolean().default(true),
  new_comment_alerts: z.boolean().default(true),
  subscription_updates: z.boolean().default(true),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type NotificationsForm = z.infer<typeof notificationsSchema>;

export default function Settings() {
  const { user } = useAuth();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  const notificationsForm = useForm<NotificationsForm>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email_notifications: true,
      new_comment_alerts: true,
      subscription_updates: true,
    },
  });

  const onProfileSubmit = async (values: ProfileForm) => {
    try {
      await api.put('/user/profile', values);
      toast.success('Profile updated');
      profileForm.reset(values);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    try {
      await api.put('/user/password', values);
      toast.success('Password changed');
      passwordForm.reset();
    } catch {
      toast.error('Failed to change password');
    }
  };

  const onNotificationsSubmit = async (values: NotificationsForm) => {
    try {
      await api.put('/user/notifications', values);
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormDescription>Email changes require verification</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={notificationsForm.control}
                  name="email_notifications"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Email Notifications</FormLabel>
                        <FormDescription>Get emails about account activity</FormDescription>
                      </div>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
                <FormField
                  control={notificationsForm.control}
                  name="new_comment_alerts"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>New Comment Alerts</FormLabel>
                        <FormDescription>Notify when someone comments on your posts</FormDescription>
                      </div>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
                <FormField
                  control={notificationsForm.control}
                  name="subscription_updates"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Subscription Updates</FormLabel>
                        <FormDescription>Updates about earnings and subscribers</FormDescription>
                      </div>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
              </div>
              <Button type="submit">Save Preferences</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}