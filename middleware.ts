import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";

// Redirects signed-out visitors away from admin pages.
// (Server actions are protected separately with requireAdmin().)
export async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    if (pathname === "/admin/login") return NextResponse.next();

    if (await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/admin", "/admin/:path*"],
};
