import { Button, Space, Typography } from "antd";
import { useNavigate } from "@tanstack/react-router";
import styles from "./NavBar.module.css";

function PublicNavBar() {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <Typography.Text strong>UYUM</Typography.Text>
      <Space size="small">
        <Button onClick={() => navigate({ to: "/login" })}>
          Iniciar sesión
        </Button>
        <Button onClick={() => navigate({ to: "/register" })}>
          Registrarse
        </Button>
      </Space>
    </nav>
  );
}

export default PublicNavBar;
