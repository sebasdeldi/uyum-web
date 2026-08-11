import { Alert, Button, Card, Space, Steps, Typography } from "antd";
import { useNavigate } from "@tanstack/react-router";
import PublicNavBar from "../components/PublicNavBar";
import styles from "./landing-page.module.css";

const CONTRACT_URL =
  "https://celo-sepolia.blockscout.com/address/0x0520F31085F7009681146002EFB9d555c30754AC";
const REPO_URL = "https://github.com/sebasdeldi/uyum-contract";
const WOMPI_URL = "https://wompi.com/es/co/";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <PublicNavBar />
      <div className={styles.content}>
        <div className={styles.hero}>
          <Typography.Title>UYUM</Typography.Title>
          <Typography.Paragraph type="secondary">
            Un experimento que replica el comportamiento de una stablecoin,
            minteada 1 a 1 con el peso colombiano, sobre la red de pruebas
            Celo Sepolia.
          </Typography.Paragraph>
          <div className={styles.ctaGroup}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate({ to: "/register" })}
            >
              Crear cuenta
            </Button>
            <Button size="large" onClick={() => navigate({ to: "/login" })}>
              Ya tengo cuenta
            </Button>
          </div>
        </div>

        <Alert
          type="warning"
          showIcon
          title="Proyecto de exploración"
          description="Esta aplicación no es un producto financiero real. Corre sobre Wompi en modo sandbox y la red de pruebas Celo Sepolia: ningún movimiento de dinero ni de tokens con valor real ocurre en ningún paso."
        />

        <Card>
          <Typography.Title level={4}>
            ¿Qué hace esta aplicación?
          </Typography.Title>
          <Typography.Paragraph>
            UYUM se mintea 1 a 1 con el peso colombiano (COP). Envías una
            tarjeta, un monto y una dirección de wallet; la aplicación
            procesa el cobro a través de{" "}
            <Typography.Link
              href={WOMPI_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Wompi
            </Typography.Link>{" "}
            y, una vez confirmado el pago, mintea la cantidad equivalente de
            UYUM directamente en tu wallet.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Al usar credenciales de prueba de Wompi, la aplicación refleja el
            ciclo de vida real de una transacción — cobro, confirmación,
            fallos incluidos — usando tarjetas de prueba, sin mover dinero
            real en ningún momento.
          </Typography.Paragraph>
        </Card>

        <Card>
          <Typography.Title level={4}>Cómo funciona el flujo</Typography.Title>
          <Steps
            orientation="vertical"
            size="small"
            items={[
              { title: "Envías tarjeta, monto y wallet" },
              { title: "Wompi procesa el cobro (sandbox)" },
              { title: "El backend confirma el pago" },
              { title: "Se mintean UYUM 1:1 en tu wallet" },
            ]}
          />
        </Card>

        <Alert
          type="info"
          showIcon
          title="El backend puede tardar en despertar"
          description="Corre en el plan gratuito de Render. Si nadie lo ha usado en un rato, la primera petición puede tardar hasta 50 segundos en responder mientras el servidor 'despierta' — no significa que algo esté roto."
        />

        <Card>
          <Typography.Title level={4}>Enlaces</Typography.Title>
          <Space orientation="vertical">
            <Typography.Link
              href={CONTRACT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver el contrato UYUM en Celo Sepolia (Blockscout)
            </Typography.Link>
            <Typography.Link
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver el repositorio del contrato en GitHub
            </Typography.Link>
            <Typography.Link
              href={WOMPI_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Conocer Wompi
            </Typography.Link>
          </Space>
        </Card>
      </div>
    </div>
  );
}

export default LandingPage;
