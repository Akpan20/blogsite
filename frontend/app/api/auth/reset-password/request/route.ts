import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/src/lib/prisma';
import { sendEmail } from '@/src/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Store token in database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      text: `Click this link to reset your password: ${resetUrl}`,
      html: `
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      `,
    });

    return NextResponse.json({ message: 'Reset instructions sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    );
  }
}

