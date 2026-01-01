"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type QrCodeTicketProps = {
  registrationId: string;
  eventTitle: string;
  userName: string;
};

export function QrCodeTicket({ registrationId, eventTitle, userName }: QrCodeTicketProps) {
  const [open, setOpen] = useState(false);

  // Generate QR code URL using public QR code generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationId)}&bgcolor=ffffff&color=000000`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${eventTitle.replace(/[^a-z0-9]/gi, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="h-4 w-4" />
          Lihat QR Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">QR Code Ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-dashed border-2">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg line-clamp-2">{eventTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{userName}</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Ticket"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-mono">
                {registrationId.slice(0, 8)}...{registrationId.slice(-4)}
              </p>
            </CardContent>
          </Card>

          <p className="text-sm text-center text-muted-foreground">
            Tunjukkan QR code ini saat registrasi di venue
          </p>

          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
