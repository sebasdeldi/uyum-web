import { Button, Card, Input, Space, Typography } from "antd";
import { Link } from "@tanstack/react-router";
import { useRegisterForm } from "../hooks/useRegisterForm";
import styles from "./authForm.module.css";

function RegisterForm() {
  const { form, isLoading, errorMessage, clearError } = useRegisterForm();

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <Typography.Title level={3}>Register</Typography.Title>
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
                  Register
                </Button>
              )}
            </form.Subscribe>
          </Space>
        </form>
        <Typography.Paragraph style={{ textAlign: "center", marginTop: 16 }}>
          Already have an account? <Link to="/login">Login</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}

export default RegisterForm;
