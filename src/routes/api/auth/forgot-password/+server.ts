import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import crypto from 'node:crypto';
import { api } from '../../../../../convex/_generated/api';
import { getConvexHttpClient } from '$lib/server/convex';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const convex = await getConvexHttpClient();
    const body = await request.json().catch(() => null);
    const rawIdentifier =
      typeof body?.identifier === 'string'
        ? body.identifier
        : typeof body?.username === 'string'
          ? body.username
          : typeof body?.email === 'string'
            ? body.email
            : '';

    if (!rawIdentifier) {
      return json({ error: 'Username is required' }, { status: 400 });
    }

    const normalizedIdentifier = rawIdentifier.trim().toLowerCase();

    let devResetLink: string | null = null;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = Date.now() + 3600000; // 1 hour
    const result = await convex.mutation(api.auth.createPasswordResetToken, {
      username: normalizedIdentifier,
      tokenHash: resetTokenHash,
      expiresAt
    });

    if (result.userFound) {
      devResetLink = `${request.headers.get('origin') || 'http://localhost:5191'}/reset-password?token=${resetToken}`;

      console.log('=== PASSWORD RESET REQUEST ===');
      console.log('User:', result.username);
      console.log('Reset Token:', resetToken);
      console.log('Reset Link:', devResetLink);
      console.log('Expires:', new Date(expiresAt).toISOString());
      console.log('=============================');
    }

    return json({ 
      success: true,
      message: 'If an account exists with that username, a password reset link has been prepared.',
      resetLink: process.env.NODE_ENV === 'production' ? undefined : devResetLink
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
