export const getFee = (method: string, price: number, namePackage="") => {
  if (method === "VIRTUAL_ACCOUNT" && namePackage.includes("Virtual Office")) {
    return Number(process.env.NEXT_PUBLIC_FEE_VA) + 2500;
  } else if (method === "VIRTUAL_ACCOUNT") {
    return Number(process.env.NEXT_PUBLIC_FEE_VA);
  }

  if (method === "QR_CODE") {
    const percentage = Number(process.env.NEXT_PUBLIC_FEE_QRIS);
    return Math.round(price * percentage);
  }
  return 0;
};
