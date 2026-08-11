import { Card, Descriptions, Spin, Tag, Typography } from "antd";
import { Link } from "@tanstack/react-router";
import { useMintOperationInfo } from "../hooks/UseMintOperationInfo";
import styles from "./mintOperationInfo.module.css";

const statusColor: Record<string, string> = {
  PENDING: "processing",
  COMPLETED: "success",
  FAILED: "error",
};

const paymentStatusColor: Record<string, string> = {
  INITIATED: "processing",
  PENDING: "processing",
  APPROVED: "success",
  DECLINED: "error",
  VOIDED: "warning",
  ERROR: "error",
};

function MintOperationInfo({ id }: { id: string }) {
  const { mintOperation, isLoading } = useMintOperationInfo(id);

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <Spin size="large" />
      </div>
    );
  }

  if (!mintOperation) {
    return (
      <div className={styles.wrapper}>
        <Card className={styles.card}>
          <Typography.Text type="danger">
            Mint operation not found
          </Typography.Text>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <Typography.Title level={4}>
          Mint Operation{" "}
          <Tag color={statusColor[mintOperation.status] ?? "default"}>
            {mintOperation.status}
          </Tag>
          {mintOperation.status === "PENDING" && (
            <Spin size="small" style={{ marginLeft: 8 }} />
          )}
        </Typography.Title>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Wallet Address">
            {mintOperation.walletAddress}
          </Descriptions.Item>
          <Descriptions.Item label="Fiat Amount">
            {mintOperation.fiatAmount} COP
          </Descriptions.Item>
          <Descriptions.Item label="Token Amount">
            {mintOperation.tokenAmount} UYUM
          </Descriptions.Item>
          {mintOperation.paymentTransaction && (
            <>
              <Descriptions.Item label="Payment Provider">
                <Tag>{mintOperation.paymentTransaction.provider}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag
                  color={
                    paymentStatusColor[
                      mintOperation.paymentTransaction.status
                    ] ?? "default"
                  }
                >
                  {mintOperation.paymentTransaction.status}
                </Tag>
              </Descriptions.Item>
            </>
          )}
          {mintOperation.onchainTxHash && (
            <Descriptions.Item label="Transaction Hash">
              <Typography.Link
                href={`https://sepolia.celoscan.io/tx/${mintOperation.onchainTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {mintOperation.onchainTxHash}
              </Typography.Link>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
      <Typography.Paragraph
        style={{ width: "100%", maxWidth: 680, marginTop: 16 }}
      >
        <Link to="/mint-operations">Back to operations</Link>
      </Typography.Paragraph>
    </div>
  );
}

export default MintOperationInfo;
