import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
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
  const { user, logout } = useAuth();
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Profile Form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Password Form
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  // Notifications Form (example values - in real app fetch from user settings)
  const notificationsForm = useForm<NotificationsForm>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email_notifications: true,
      new_comment_alerts: true,
      subscription_updates: true,
    },
  });

  const onProfileSubmit = async (values: ProfileForm) => {
    setIsProfileSubmitting(true);
    try {
      await api.put('/user/profile', values);
      toast.success('Profile updated successfully');
      profileForm.reset(values); // reset to new values
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    setIsPasswordSubmitting(true);
    try {
      await api.put('/user/password', {
        current_password: values.current_password,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      toast.success('Password updated successfully');
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const onNotificationsSubmit = async (values: NotificationsForm) => {
    try {
      await api.put('/user/notifications', values);
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
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
                      <Input placeholder="Your name" {...field} />
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
                      <Input type="email" disabled {...field} />
                    </FormControl>
                    <FormDescription>
                      Email changes require verification (coming soon)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
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
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={notificationsForm.control}
                  name="email_notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>
                          Receive emails about activity on your blog
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationsForm.control}
                  name="new_comment_alerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">New Comment Alerts</FormLabel>
                        <FormDescription>
                          Get notified when someone comments on your posts
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationsForm.control}
                  name="subscription_updates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Subscription Updates</FormLabel>
                        <FormDescription>
                          Updates about your subscribers and earnings
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Save Preferences</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Delete Account</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="destructive" className="mt-4" disabled>
              Delete Account (Coming Soon)
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700">
              Log Out from All Devices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}