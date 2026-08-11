import { Outlet } from "@tanstack/react-router";
import NavBar from "../components/NavBar";

function AuthenticatedLayout() {
  return (
    <>
      <NavBar />
      <div style={{ paddingTop: 64 }}>
        <Outlet />
      </div>
    </>
  );
}

export default AuthenticatedLayout;
