/**
 * Settings API Handler Tests
 */

// =============================================================================
// Mocks
// =============================================================================
const dbMock = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        is: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'emp-1', name: 'Test User', email: 'test@example.com', phone: '+1234567890' },
            error: null,
          }),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'emp-1', name: 'Updated User', email: 'updated@example.com', phone: '+9876543210' },
            error: null,
          }),
        })),
      })),
    })),
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'test@example.com' } }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
  },
};

vi.mock('../../../../../supabase/server', () => ({
  createClient: vi.fn(() => dbMock),
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGetProfile, handleUpdateProfile, handleChangePassword } from '../handlers';

const testEndpoint = 'http://test';

describe('Settings API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mock returns
    dbMock.auth.getUser.mockResolvedValue({ 
      data: { user: { id: 'user-1', email: 'test@example.com' } }, 
      error: null 
    });
    dbMock.auth.signInWithPassword.mockResolvedValue({ error: null });
    dbMock.auth.updateUser.mockResolvedValue({ error: null });
  });

  // ===========================================================================
  // handleGetProfile Tests
  // ===========================================================================
  describe('handleGetProfile', () => {
    it('returns 401 when user is not authenticated', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const response = await handleGetProfile();

      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ error: 'Unauthorized' });
    });

    it('returns 200 with profile data when authenticated', async () => {
      const response = await handleGetProfile();

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toMatchObject({
        id: 'emp-1',
        name: 'Test User',
        email: 'test@example.com',
      });
    });
  });

  // ===========================================================================
  // handleUpdateProfile Tests
  // ===========================================================================
  describe('handleUpdateProfile', () => {
    it('returns 401 when user is not authenticated', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const request = new Request(testEndpoint, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      });
      const response = await handleUpdateProfile(request);

      expect(response.status).toBe(401);
    });

    it('returns 400 for invalid input (empty name)', async () => {
      const request = new Request(testEndpoint, {
        method: 'PATCH',
        body: JSON.stringify({ name: '' }),
      });
      const response = await handleUpdateProfile(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.message).toBeDefined();
    });

    it('returns 200 on successful profile update', async () => {
      const request = new Request(testEndpoint, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated User', email: 'updated@example.com' }),
      });
      const response = await handleUpdateProfile(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.name).toBe('Updated User');
    });
  });

  // ===========================================================================
  // handleChangePassword Tests
  // ===========================================================================
  describe('handleChangePassword', () => {
    it('returns 401 when user is not authenticated', async () => {
      dbMock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const request = new Request(testEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword456',
          confirmPassword: 'NewPassword456',
        }),
      });
      const response = await handleChangePassword(request);

      expect(response.status).toBe(401);
    });

    it('returns 400 for mismatched passwords', async () => {
      const request = new Request(testEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword456',
          confirmPassword: 'Different789',
        }),
      });
      const response = await handleChangePassword(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.message).toBe("Passwords don't match");
    });

    it('returns 400 when current password is incorrect', async () => {
      dbMock.auth.signInWithPassword.mockResolvedValueOnce({
        error: { message: 'Invalid login credentials' },
      });

      const request = new Request(testEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword456',
          confirmPassword: 'NewPassword456',
        }),
      });
      const response = await handleChangePassword(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.message).toBe('Current password is incorrect');
    });

    it('returns 200 on successful password change', async () => {
      const request = new Request(testEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword456',
          confirmPassword: 'NewPassword456',
        }),
      });
      const response = await handleChangePassword(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.message).toBe('Password changed successfully');
    });
  });
});
