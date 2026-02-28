import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import EnrollmentPage from "./pages/EnrollmentPage";

type Route = "/" | "/admin";

export default function App() {
  const [route, setRoute] = useState<Route>(() => {
    const path = window.location.pathname;
    if (path.startsWith("/admin")) return "/admin";
    return "/";
  });

  const navigate = (to: Route) => {
    window.history.pushState({}, "", to);
    setRoute(to);
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      {route === "/" && (
        <EnrollmentPage onNavigateAdmin={() => navigate("/admin")} />
      )}
      {route === "/admin" && <AdminPage onNavigateHome={() => navigate("/")} />}
    </>
  );
}
