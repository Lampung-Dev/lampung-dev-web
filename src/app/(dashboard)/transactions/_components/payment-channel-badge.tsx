import Image from "next/image";

type PaymentChannelBadgeProps = {
  channel?: string | null;
};

const CHANNEL_MAP: Record<string, { label: string; logo: string }> = {
  "MDR.VA": {
    label: "Mandiri VA",
    logo: "/images/payment_channel/mandiri.png",
  },
  "BNI.VA": {
    label: "BNI VA",
    logo: "/images/payment_channel/bni.png",
  },
  "BRI.VA": {
    label: "BRI VA",
    logo: "/images/payment_channel/bri.png",
  },
  "PTB.VA": {
    label: "Permata VA",
    logo: "/images/payment_channel/permata.png",
  },
  "CIMBN.VA": {
    label: "CIMB VA",
    logo: "/images/payment_channel/cimb.png",
  },
  QRIS: {
    label: "QRIS",
    logo: "/images/payment_channel/qris.png",
  },
};

export function PaymentChannelBadge({ channel }: PaymentChannelBadgeProps) {
  const data = CHANNEL_MAP[channel || "QRIS"];

  if (!data) {
    return <span className="text-sm">{channel}</span>;
  }

  return (
    <div className="inline-flex items-center justify-center rounded-md bg-white p-1.5 shadow-sm">
      <Image
        src={data.logo}
        alt={data.label}
        width={40}
        height={40}
        className="object-contain"
      />
    </div>
  );
}
