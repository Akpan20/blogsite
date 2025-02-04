'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import Image from 'next/image';
import type { TwoFactorSecret } from '@/src/types/auth';

export default function TwoFactorSetupPage() {
  const { data: session } = useSession();
  const [secret, setSecret] = useState<TwoFactorSecret | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateSecret = async () => {
      try {
        const response = await fetch('/api/auth/2fa/generate');
        const data = await response.json();
        if (response.ok) {
          setSecret(data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Failed to generate 2FA secret');
      }
    };

    if (!session?.user?.twoFactorEnabled) {
      generateSecret();
    }
  }, [session]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          secret: secret?.secret,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Two-factor authentication enabled successfully');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      setError('Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.twoFactorEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Two-factor authentication is currently enabled for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                const response = await fetch('/api/auth/2fa/disable', {
                  method: 'POST',
                });
                if (response.ok) {
                  window.location.reload();
                }
              } catch (error) {
                setError('Failed to disable 2FA');
              }
            }}
          >
            Disable 2FA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enhance your account security by enabling two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {secret && (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Scan QR Code</h3>
                <div className="bg-white p-4 inline-block rounded-lg">
                  <Image
                    src={secret.qr_code}
                    alt="QR Code"
                    width={200}
                    height={200}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Manual Entry</h3>
                <p className="text-sm text-gray-600 mb-2">
                  If you can't scan the QR code, enter this code manually in your authenticator app:
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {secret.secret}
                </code>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">3. Verify Setup</h3>
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    pattern="\d{6}"
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify and Enable 2FA'}
                </Button>
              </form>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}