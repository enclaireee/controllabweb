import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 renamed middleware to `proxy`. Two jobs:
 *   1. refresh the Supabase session cookie on every request
 *   2. keep people out of routes their role has no business in
 *
 * (2) is convenience, not security. RLS is the real boundary — a praktikan who
 * bypasses these redirects still gets zero rows from the database.
 */

/** Signed-in only. */
const TERLINDUNGI = ["/praktikum", "/penilaian"];
/** Asisten only. */
const KHUSUS_ASISTEN = ["/penilaian"];
/** Pointless once you are signed in. */
const HANYA_TAMU = ["/login", "/register", "/lupa-sandi"];

const cocok = (path: string, daftar: string[]) =>
  daftar.some((p) => path === p || path.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Also refreshes the session cookie if it expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const ke = (tujuan: string) => {
    const url = request.nextUrl.clone();
    url.pathname = tujuan;
    url.search = "";
    return NextResponse.redirect(url);
  };

  // Not signed in, asking for something protected → login, remembering where.
  if (!user && cocok(path, TERLINDUNGI)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  if (user) {
    // /reset-sandi is absent from HANYA_TAMU on purpose: the emailed link
    // signs you in with a recovery session, so you are always "logged in"
    // by the time you get there.
    if (cocok(path, HANYA_TAMU)) return ke("/praktikum");

    if (cocok(path, KHUSUS_ASISTEN)) {
      const { data: profil } = await supabase
        .from("profil")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profil?.role !== "asisten") return ke("/praktikum");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
