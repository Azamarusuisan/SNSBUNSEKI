import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Demo mode: skip auth when Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    return NextResponse.next();
  }

  // Real auth flow
  const { updateSession } = await import('@/lib/supabase/middleware');
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
