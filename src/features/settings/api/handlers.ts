/**
 * Settings API Handlers
 */

import { NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';
import { profileUpdateSchema, passwordChangeSchema } from '../domain/schemas';
import type { Employee } from '@/shared/types/database.types';

// =============================================================================
// PROFILE HANDLERS
// =============================================================================

/**
 * GET /api/settings/profile
 * Fetch current user's employee profile
 */
export async function handleGetProfile() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: employee, error } = await (supabase as any)
    .from('employees')
    .select('id, name, email, phone')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return NextResponse.json({ error: 'No employee profile linked' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: employee });
}

/**
 * PATCH /api/settings/profile
 * Update current user's personal employee fields
 */
export async function handleUpdateProfile(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse and validate input
  const body = await request.json();
  const result = profileUpdateSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: { message: result.error.issues[0].message } },
      { status: 400 }
    );
  }

  // Find employee record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: employee, error: findError } = await (supabase as any)
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (findError) {
    if (findError.code === 'PGRST116') {
      return NextResponse.json({ error: 'No employee profile linked' }, { status: 404 });
    }
    return NextResponse.json({ error: findError.message }, { status: 400 });
  }

  // Update employee record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated, error: updateError } = await (supabase as any)
    .from('employees')
    .update({
      name: result.data.name,
      email: result.data.email || null,
      phone: result.data.phone || null,
    })
    .eq('id', (employee as Pick<Employee, 'id'>).id)
    .select('id, name, email, phone')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ data: updated });
}

// =============================================================================
// PASSWORD HANDLERS
// =============================================================================

/**
 * POST /api/settings/password
 * Change password with current password verification
 */
export async function handleChangePassword(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse and validate input
  const body = await request.json();
  const result = passwordChangeSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: { message: result.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = result.data;

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json(
      { error: { message: 'Current password is incorrect' } },
      { status: 400 }
    );
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error('Password update error:', updateError);
    return NextResponse.json(
      { error: { message: 'Failed to update password' } },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: { message: 'Password changed successfully' } });
}
