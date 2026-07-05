import { Metadata } from "next";
import { CareerClient } from "./_components/career-client";

export const metadata: Metadata = {
  title: "Career | Lampung Dev",
  description:
    "Temukan lowongan kerja terbaik di bidang teknologi untuk komunitas Lampung Dev.",
};

export default function CareerPage() {
  return <CareerClient />;
}
