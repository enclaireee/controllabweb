import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const TERLINDUNGI = ["/praktikum", "/asisten"];

const KHUSUS_ASISTEN = ["/asisten"];

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

  if (!user && cocok(path, TERLINDUNGI)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  if (user) {
    const perluRole =
      cocok(path, HANYA_TAMU) ||
      cocok(path, KHUSUS_ASISTEN) ||
      cocok(path, ["/praktikum"]);

    if (perluRole) {
      const { data: profil } = await supabase
        .from("profil")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const asisten = profil?.role === "asisten";
      const beranda = asisten ? "/asisten" : "/praktikum";

      if (cocok(path, HANYA_TAMU)) return ke(beranda);
      if (cocok(path, KHUSUS_ASISTEN) && !asisten) return ke("/praktikum");
      if (asisten && cocok(path, ["/praktikum"])) return ke("/asisten");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
