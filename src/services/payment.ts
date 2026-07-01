import crypto from "crypto";

type CreatePaymentParams = {
  amount: number;
  name: string;
  paymentMethod: string;
  paymentChannel: string;
  referenceCode: string;
  callbackUrl: string;
  redirectUrl: string;
};

export async function createPaymentService(params: CreatePaymentParams) {
  const apiBaseUrl =
    process.env.PAYMENT_API_URL || "https://api.paymentprovider.com/v1";
  const accessKey = process.env.PAYMENT_API_KEY || "";
  const secretKey = process.env.PAYMENT_SECRET_KEY || "";

  const uri = "/v1/payins";
  const method = "POST";
  const timestamp = new Date().toISOString();

  const payload = {
    initiatedAmount: params.amount.toFixed(2),
    currency: "IDR",
    paymentMethod: params.paymentMethod,
    paymentChannel: params.paymentChannel,
    referenceCode: params.referenceCode,
    customerReference: Date.now().toString(),
    customerName: params.name,
    callbackUrl: params.callbackUrl,
    redirectUrl: params.redirectUrl,
  };

  const bodyString = JSON.stringify(payload);

  const signaturePayload = `${method}\n${uri}\n${timestamp}\n${bodyString}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signaturePayload)
    .digest("base64");

  const response = await fetch(`${apiBaseUrl}${uri}`, {
    method,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "Xenith-Api-Key": accessKey,
      "Xenith-Request-Timestamp": timestamp,
      "Xenith-Request-Signature": signature,
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: bodyString,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Gagal membuat pembayaran");
  }

  return result;
}
