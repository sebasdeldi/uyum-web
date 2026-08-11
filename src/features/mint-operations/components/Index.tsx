import { Button, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMintOperationsList } from "../hooks/UseMintOperationsList";
import { statusColor } from "../statusColors";
import type { MintOperationResponse } from "../../../clients/payloads";
import styles from "./index.module.css";

const columns: TableColumnsType<MintOperationResponse> = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Tokens", dataIndex: "tokenAmount", key: "tokenAmount" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag color={statusColor[status] ?? "default"}>{status}</Tag>
    ),
  },
  { title: "Wallet Address", dataIndex: "walletAddress", key: "walletAddress" },
];

function Index() {
  const navigate = useNavigate();
  const { mintOperations, total, page, pageSize, setPage, isLoading } =
    useMintOperationsList();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Mint Operations
        </Typography.Title>
        <Link to="/mint-operations/new">
          <Button type="primary">New Mint Operation</Button>
        </Link>
      </div>
      <Table<MintOperationResponse>
        rowKey="id"
        columns={columns}
        dataSource={mintOperations}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
        }}
        onChange={(pagination) => {
          setPage(pagination.current ?? 1);
        }}
        onRow={(record) => ({
          onClick: () =>
            navigate({ to: "/mint-operation/$id", params: { id: record.id } }),
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
}

export default Index;
