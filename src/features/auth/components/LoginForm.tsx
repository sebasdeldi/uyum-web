import { Button, Card, Input, Space, Typography } from "antd";
import { Link } from "@tanstack/react-router";
import styles from "./authForm.module.css";
import { useLoginForm } from "../hooks/useLoginForm";

function LoginForm() {
  const { form, isLoading, errorMessage, clearError } = useLoginForm();

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <Typography.Title level={3}>Login</Typography.Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            <form.Field name="email">
              {(field) => (
                <div>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearError();
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Email"
                  />
                  {field.state.value &&
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <Typography.Text type="danger">
                        {field.state.meta.errors[0]?.message}
                      </Typography.Text>
                    )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div>
                  <Input.Password
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearError();
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Password"
                  />
                </div>
              )}
            </form.Field>

            {errorMessage && (
              <Typography.Text type="danger">{errorMessage}</Typography.Text>
            )}

            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  disabled={!canSubmit}
                  block
                >
                  Login
                </Button>
              )}
            </form.Subscribe>
          </Space>
        </form>
        <Typography.Paragraph style={{ textAlign: "center", marginTop: 16 }}>
          Don't have an account? <Link to="/register">Register</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}

export default LoginForm;
