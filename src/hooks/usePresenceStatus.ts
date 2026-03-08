import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function usePresenceStatus(userId?: Id<"users">) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? {} : "skip"
  );

  const updateStatusMutation = useMutation(api.users.updatePresenceStatus);

  const openStatusModal = useCallback(() => {
    setIsStatusModalOpen(true);
  }, []);

  const closeStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
  }, []);

  const updateStatus = useCallback(
    async (status: string, message?: string) => {
      if (!userId) {
        toast.error("User ID not found");
        return;
      }

      try {
        await updateStatusMutation({
          userId,
          presenceStatus: status as any,
          outOfOfficeMessage: message,
        });
        return true;
      } catch (error) {
        console.error("Failed to update status:", error);
        toast.error("Failed to update status");
        return false;
      }
    },
    [userId, updateStatusMutation]
  );

  return {
    isStatusModalOpen,
    openStatusModal,
    closeStatusModal,
    updateStatus,
    currentStatus: currentUser?.presenceStatus,
  };
}
