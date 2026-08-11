import { Button, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getMe } from "../clients/core";
import { useAuthStore } from "../store/auth-store";
import styles from "./NavBar.module.css";

function NavBar() {
  const navigate = useNavigate();
  const clearToken = useAuthStore((state) => state.clearToken);
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  function handleLogout() {
    clearToken();
    navigate({ to: "/login" });
  }

  return (
    <nav className={styles.navbar}>
      <Typography.Text>{meQuery.data?.email}</Typography.Text>
      <Button onClick={handleLogout}>Logout</Button>
    </nav>
  );
}

export default NavBar;
