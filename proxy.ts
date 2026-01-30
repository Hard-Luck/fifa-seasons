import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function proxy(req: NextRequest) {
    // Note: We can't use auth() here as it imports Prisma which doesn't work in Edge Runtime
    // Instead, we'll rely on NextAuth's built-in session checking via cookies
    const token = req.cookies.get("authjs.session-token") || req.cookies.get("__Secure-authjs.session-token")
    const isAuthenticated = !!token
    const isLoginPage = req.nextUrl.pathname === "/login"

    if (!isAuthenticated && !isLoginPage) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    if (isAuthenticated && isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
