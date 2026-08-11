import {
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  Space,
  Typography,
} from "antd";
import { useCreateMintForm } from "../hooks/UseCreateMintForm";
import styles from "./createMintForm.module.css";

function CreateMintForm() {
  const { form, isLoading, errorMessage, clearError } = useCreateMintForm();

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <Typography.Title level={3}>Mint Tokens</Typography.Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Mint details
            </Typography.Title>

            <form.Field name="amount">
              {(field) => (
                <div>
                  <InputNumber
                    value={field.state.value}
                    onChange={(value) => {
                      field.handleChange(value ?? 0);
                      clearError();
                    }}
                    onBlur={field.handleBlur}
                    prefix="$"
                    style={{ width: "100%" }}
                    placeholder="Amount"
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <Typography.Text type="danger">
                        {field.state.meta.errors[0]?.message}
                      </Typography.Text>
                    )}
                </div>
              )}
            </form.Field>

            <form.Field name="address">
              {(field) => (
                <div>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearError();
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Wallet Address (0x...)"
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

            <Divider style={{ margin: 0 }} />

            <Typography.Title level={5} style={{ margin: 0 }}>
              Card details
            </Typography.Title>

            <form.Field name="cardHolder">
              {(field) => (
                <div>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearError();
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Cardholder Name"
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

            <form.Field name="number">
              {(field) => (
                <div>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearError();
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Card Number"
                    inputMode="numeric"
                  />

                  <Typography.Text type="secondary">
                    Use 4242424242424242 for testing
                  </Typography.Text>

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

            <div className={styles.row}>
              <form.Field name="expMonth">
                {(field) => (
                  <div>
                    <Input
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        clearError();
                      }}
                      onBlur={field.handleBlur}
                      placeholder="MM"
                      inputMode="numeric"
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

              <form.Field name="expYear">
                {(field) => (
                  <div>
                    <Input
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        clearError();
                      }}
                      onBlur={field.handleBlur}
                      placeholder="YY"
                      inputMode="numeric"
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

              <form.Field name="cvc">
                {(field) => (
                  <div>
                    <Input.Password
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        clearError();
                      }}
                      onBlur={field.handleBlur}
                      placeholder="CVC"
                      inputMode="numeric"
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
            </div>

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
                  Mint
                </Button>
              )}
            </form.Subscribe>
          </Space>
        </form>
      </Card>
    </div>
  );
}

export default CreateMintForm;
