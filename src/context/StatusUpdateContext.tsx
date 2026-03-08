"use client";

import React, { createContext, useContext, useState } from "react";

interface StatusUpdateNotification {
  statusLabel: string;
  timestamp: number;
}

interface StatusUpdateContextType {
  notification: StatusUpdateNotification | null;
  showNotification: (statusLabel: string) => void;
  hideNotification: () => void;
}

const StatusUpdateContext = createContext<StatusUpdateContextType | undefined>(undefined);

export function StatusUpdateProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<StatusUpdateNotification | null>(null);

  const showNotification = (statusLabel: string) => {
    setNotification({
      statusLabel,
      timestamp: Date.now(),
    });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <StatusUpdateContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </StatusUpdateContext.Provider>
  );
}

export function useStatusUpdate() {
  const context = useContext(StatusUpdateContext);
  if (context === undefined) {
    throw new Error("useStatusUpdate must be used within StatusUpdateProvider");
  }
  return context;
}
