/**
 * Current Employee API Route
 * /api/employees/me
 * 
 * Returns the employee record for the currently authenticated user
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  console.log('[/api/employees/me] Auth result:', { userId: user?.id, authError });
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find employee linked to this user
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  console.log('[/api/employees/me] Employee query:', { 
    userId: user.id, 
    employee: employee?.id, 
    error: error?.message 
  });

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return NextResponse.json({ error: 'No employee record found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: employee });
}
