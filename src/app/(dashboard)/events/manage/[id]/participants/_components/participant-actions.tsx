"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Check,
  UserCheck,
  UserMinus,
  Clock,
  Ban,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  updateRegistrationStatusAction,
  toggleAttendanceAction,
} from "@/actions/events/manage-registration-action";

interface ParticipantActionsProps {
  registrationId: string;
  eventId: string;
  currentStatus: "REGISTERED" | "WAITING_LIST" | "CANCELLED";
  isAttended: boolean;
}

export function ParticipantActions({
  registrationId,
  eventId,
  currentStatus,
  isAttended,
}: ParticipantActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (
    status: "REGISTERED" | "WAITING_LIST" | "CANCELLED"
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("registrationId", registrationId);
      formData.append("status", status);
      formData.append("eventId", eventId);

      const result = await updateRegistrationStatusAction(formData);
      if (result.success) {
        toast.success(`Status berhasil diubah menjadi ${status}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah status"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("registrationId", registrationId);
      formData.append("eventId", eventId);

      const result = await toggleAttendanceAction(formData);
      if (result.success) {
        toast.success(
          result.attended ? "Peserta ditandai hadir" : "Kehadiran dibatalkan"
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah kehadiran"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isAttended ? "secondary" : "outline"}
        size="sm"
        disabled={loading || currentStatus !== "REGISTERED"}
        onClick={handleToggleAttendance}
        className="gap-1.5 h-8"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isAttended ? (
          <UserMinus size={14} />
        ) : (
          <UserCheck size={14} />
        )}
        {isAttended ? "Batal Hadir" : "Set Hadir"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={loading}
          >
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Kelola Status</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleUpdateStatus("REGISTERED")}
            disabled={currentStatus === "REGISTERED"}
            className="gap-2"
          >
            <Check size={14} className="text-green-600" />
            Set Registered
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleUpdateStatus("WAITING_LIST")}
            disabled={currentStatus === "WAITING_LIST"}
            className="gap-2"
          >
            <Clock size={14} className="text-amber-600" />
            Set Waiting List
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleUpdateStatus("CANCELLED")}
            disabled={currentStatus === "CANCELLED"}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Ban size={14} />
            Set Cancelled
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
