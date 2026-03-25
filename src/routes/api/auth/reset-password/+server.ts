import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import crypto from 'node:crypto';
import { hashPassword } from '$lib/server/auth';
import { api } from '../../../../../convex/_generated/api';
import { getConvexHttpClient } from '$lib/server/convex';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const convex = await getConvexHttpClient();
    const body = await request.json().catch(() => null);
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!token || !password) {
      return json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 12) {
      return json({ error: 'Password must be at least 12 characters' }, { status: 400 });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { salt, hash } = await hashPassword(password);
    await convex.mutation(api.auth.resetPasswordWithToken, {
      tokenHash,
      passwordHash: hash,
      passwordSalt: salt
    });

    return json({
      success: true,
      message: 'Your password has been reset. You can sign in now.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    const message = error instanceof Error ? error.message : 'Failed to reset password';
    const status = message === 'This reset link is invalid or has expired' ? 400 : 500;
    return json({ error: message }, { status });
  }
};
