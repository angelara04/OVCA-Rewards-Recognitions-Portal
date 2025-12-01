import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// RBAC DEFINITION
const PUBLIC_ROUTES = [
    '/login',
    '/auth', // Match /auth and /auth/*
    '/error',
    '/unauthorized', 
]

const ROLE_PERMISSIONS = {
    // Authenticated users (including no-role) need access to these to complete the registration flow.
    AUTHENTICATED_ALL: [
        '/', // allow initial landing to prevent login loops (can't be seen by users)
        '/login',
        '/registry',
        '/pending',
    ],
    nominator: [
        '/nominators',
    ],
    committee: [
        '/committee',
    ],
    hr: [
        '/hr',
    ]
}

// Checks if the pathname is one of the allowed routes for a given set of permissions.
function isPathAllowed(pathname: string, allowedRoutes: string[]): boolean {
    return allowedRoutes.some(route => {
        // Strict check: if the route is root '/', exact match required
        if (route === '/') {
            return pathname === '/';
        }
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

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname
    let userRole: string | null = null;

    // DEBUGGING LOGS
    // if (path.startsWith('/nominators') || path.startsWith('/committee') || path.startsWith('/hr') || path === '/' || path.startsWith('/registry') || path.startsWith('/unauthorized')) {
    //     console.log(`[Middleware] Request: ${path}`)
    //     console.log(`[Middleware] Auth User: ${user?.id || 'Unauthenticated'}`)
    // }

    // If no user, only allow PUBLIC_ROUTES
    if (!user && !isPathAllowed(path, PUBLIC_ROUTES)) {
        // console.log(`[Middleware] ⛔ UNAUTHENTICATED ACCESS DENIED. Redirecting to /login.`)
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

        // console.log(`[Middleware] Fetched Role: ${userRole}`);

        // Check if the path is a public safety route (like /unauthorized)
        if (isPathAllowed(path, PUBLIC_ROUTES)) {
             // console.log(`[Middleware] ✅ PUBLIC ACCESS GRANTED for authenticated user.`);
             return supabaseResponse;
        }

        // TRAFFIC CONTROLLER FOR ROOT PATH '/'
        if (path === '/') {
            const url = request.nextUrl.clone();
            
            if (userRole === 'nominator') {
                url.pathname = '/nominators/dashboard'; 
            } else if (userRole === 'committee') {
                url.pathname = '/committee/review-dashboard'; 
            } else if (userRole === 'hr') {
                url.pathname = '/hr/hr-dashboard'; 
            } else {
                // No-role users or unknowns go to login
                url.pathname = '/login';
            }
            
            // console.log(`[Middleware] 🔀 ROOT REDIRECT for ${userRole} to ${url.pathname}`);
            return NextResponse.redirect(url);
        }

        // NO-ROLE USERS (Strict Lockdown)
        if (userRole === 'no-role') {
             const allowedNoRolePaths = ['/login', '/registry', '/pending']; 
             
             if (!isPathAllowed(path, allowedNoRolePaths)) {
                //  console.log(`[Middleware] ⛔ NO-ROLE USER RESTRICTED. Redirecting to /login.`);
                 const url = request.nextUrl.clone();
                 url.pathname = '/login';
                 return NextResponse.redirect(url);
             }
             return supabaseResponse;
        }

        // Combine all allowed routes for the current user's role
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
        
        // Check if the current path is allowed by the role
        let isPathAuthorized = isPathAllowed(path, allowedRoutes);
        
        if (!isPathAuthorized) {
            // console.log(`[Middleware] ⛔ RBAC DENIAL for Role: ${userRole}. Path: ${path}. Redirecting to /unauthorized.`)
            const url = request.nextUrl.clone()
            url.pathname = '/unauthorized' 
            return NextResponse.redirect(url)
        }
        
        // console.log(`[Middleware] ✅ ACCESS GRANTED for ${userRole}.`);
    }

    return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}