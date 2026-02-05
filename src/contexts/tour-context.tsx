"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TourContextType {
  isTourOpen: boolean;
  hasSeenTour: boolean;
  openTour: () => void;
  closeTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = "cc_tour_completed";

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default to true to avoid flash

  useEffect(() => {
    // Check if user has seen the tour before
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    setHasSeenTour(tourCompleted === "true");
  }, []);

  const openTour = () => setIsTourOpen(true);
  const closeTour = () => setIsTourOpen(false);

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setHasSeenTour(true);
    setIsTourOpen(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setHasSeenTour(false);
  };

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        hasSeenTour,
        openTour,
        closeTour,
        completeTour,
        resetTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}






