import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <>
      <Outlet />
      <Navbar />
    </>
  );
}
