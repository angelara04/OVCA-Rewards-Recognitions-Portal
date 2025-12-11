import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// RBAC DEFINITION
const PUBLIC_ROUTES = [
    '/login',
    '/auth', 
    '/error',
    '/unauthorized', 
]

const ROLE_PERMISSIONS = {
    // Authenticated users (including no-role) need access to these
    AUTHENTICATED_ALL: [
        '/', 
        '/login',
        '/registry',
        '/pending',      
        '/admin/portal-closed'  // comment out during beta
    ],
    nominator: [
        '/nominators',
    ],
    committee: [
        '/committee',
        '/nominators',  
        // '/admin',       // comment out during beta
    ],
    hr: [
        '/hr',
        // '/admin',      // comment out during beta
    ]
}

function isPathAllowed(pathname: string, allowedRoutes: string[]): boolean {
    return allowedRoutes.some(route => {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    });
}

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value }) =>
                        supabaseResponse.cookies.set(name, value)
                    )
                },
            },
        }
    )

    const path = request.nextUrl.pathname

    // Allow Next.js data fetching (_next/data) and static files to pass through RBAC
    if (path.startsWith('/_next') || path.startsWith('/api')) {
        return supabaseResponse;
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let userRole: string | null = null;

    // If no user, only allow PUBLIC_ROUTES
    if (!user && !isPathAllowed(path, PUBLIC_ROUTES)) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user) {
        
        // Fetch User Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile && profile.role) {
            userRole = profile.role;
        } else {
            userRole = 'no-role'; 
        }

        // Public Access Check
        if (isPathAllowed(path, PUBLIC_ROUTES)) {
             return supabaseResponse;
        }

        // TRAFFIC CONTROLLER FOR ROOT PATH '/'
        if (path === '/') {
            const url = request.nextUrl.clone();
            if (userRole === 'nominator') url.pathname = '/nominators/dashboard'; 
            else if (userRole === 'committee') url.pathname = '/committee/review-dashboard'; 
            else if (userRole === 'hr') url.pathname = '/hr/hr-dashboard'; 
            else url.pathname = '/login';
            
            return NextResponse.redirect(url);
        }

        // NO-ROLE USERS (Strict Lockdown)
        if (userRole === 'no-role') {
             const allowedNoRolePaths = ['/login', '/registry', '/pending']; 
             if (!isPathAllowed(path, allowedNoRolePaths)) {
                 const url = request.nextUrl.clone();
                 url.pathname = '/login';
                 return NextResponse.redirect(url);
             }
             return supabaseResponse;
        }

        // --- RBAC PERMISSION BUILDER ---
        let allowedRoutes = [...ROLE_PERMISSIONS.AUTHENTICATED_ALL]; 

        if (userRole === 'nominator') {
            allowedRoutes = [...allowedRoutes, ...ROLE_PERMISSIONS.nominator];
        }
        if (userRole === 'committee') {
            allowedRoutes = [...allowedRoutes, ...ROLE_PERMISSIONS.committee];
        }
        if (userRole === 'hr') {
            allowedRoutes = [...allowedRoutes, ...ROLE_PERMISSIONS.hr];
        }
        
        const isPathAuthorized = isPathAllowed(path, allowedRoutes);
     
        if (!isPathAuthorized) {
            if (request.method === 'GET') {
                const url = request.nextUrl.clone()
                url.pathname = '/unauthorized' 
                return NextResponse.redirect(url)
            } else {
                return supabaseResponse;
            }
        }
        
        // 1. NOMINATOR PORTAL RESTRICTION
        if (request.method === 'GET' && path.startsWith('/nominators') && !path.startsWith('/portal-closed')) {
            const { data: setting } = await supabase
                .from('portal_settings')
                .select('start_at, end_at, is_active')
                .eq('setting_key', 'nomination_period')
                .single()

            let isOpen = false;
            if (setting && setting.is_active && setting.start_at && setting.end_at) {
                const now = new Date();
                const start = new Date(setting.start_at);
                const end = new Date(setting.end_at);
                isOpen = now >= start && now <= end;
            }

            if (!isOpen) {
                const url = request.nextUrl.clone();
                url.pathname = '/admin/portal-closed';
                url.searchParams.set('reason', 'nomination');
                url.searchParams.set('source', 'nominator'); 
                return NextResponse.redirect(url);
            }
        }

        // 2. COMMITTEE PORTAL RESTRICTION
        if (request.method === 'GET' && path.startsWith('/committee') && !path.startsWith('/portal-closed')) {
            const { data: setting } = await supabase
                .from('portal_settings')
                .select('start_at, end_at, is_active')
                .eq('setting_key', 'scoring_period')
                .single()

            let isOpen = false;
            if (setting && setting.is_active && setting.start_at && setting.end_at) {
                const now = new Date();
                const start = new Date(setting.start_at);
                const end = new Date(setting.end_at);
                isOpen = now >= start && now <= end;
            }

            if (!isOpen) {
                const url = request.nextUrl.clone();
                url.pathname = '/admin/portal-closed';
                url.searchParams.set('reason', 'scoring');
                url.searchParams.set('source', 'committee');
                return NextResponse.redirect(url);
            }
        }
    }

    return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}