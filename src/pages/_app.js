import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const publicPaths = ["/"];
    const path = router.pathname;
    const isLoggedIn = localStorage.getItem("neela_logged_in") === "true";

    if (!isLoggedIn && !publicPaths.includes(path)) {
      setTimeout(() => {
        setAuthorized(false);
      }, 0);
      router.push("/");
    } else {
      setTimeout(() => {
        setAuthorized(true);
      }, 0);
    }
  }, [router, router.pathname]);

  const isPublicPath = router.pathname === "/";

  if (!authorized && !isPublicPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a6fc4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-black tracking-widest text-slate-400 uppercase">Verifying Authorization...</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

