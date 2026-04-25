import { createContext, useContext, useState, ReactNode } from "react";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  baseRate: string;
  priceUnit: string;
  estimatedDuration: string;
  isActive: boolean;
}

interface ProviderProfile {
  businessName: string;
  serviceDescription: string;
  yearsExperience: string;
  coverPhotoUrl: string;
  profilePhotoUrl: string;
}

interface DaySchedule {
  available: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

interface ProviderData {
  blockedDates: string[];
  services: Service[];
  profile: ProviderProfile;
  availability: { [key: string]: DaySchedule };
}

interface ProviderDataContextType {
  providerData: ProviderData;
  setProviderData: (data: ProviderData) => void;
  blockedDates: string[];
  addBlockedDates: (dates: string[]) => void;
  removeBlockedDate: (date: string) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
  profile: ProviderProfile;
  updateProfile: (updates: Partial<ProviderProfile>) => void;
}

const ProviderDataContext = createContext<ProviderDataContextType | undefined>(undefined);

export function ProviderDataProvider({ children }: { children: ReactNode }) {
  const [providerData, setProviderData] = useState<ProviderData>({
    blockedDates: ["2026-03-25", "2026-03-26"],
    services: [
      {
        id: "1",
        name: "House Cleaning",
        category: "Residential",
        description: "Standard house cleaning service including all rooms",
        baseRate: "500",
        priceUnit: "per hour",
        estimatedDuration: "3-4 hours",
        isActive: true,
      },
      {
        id: "2",
        name: "Deep Cleaning",
        category: "Residential",
        description: "Thorough deep cleaning with sanitization",
        baseRate: "800",
        priceUnit: "per hour",
        estimatedDuration: "4-6 hours",
        isActive: true,
      },
      {
        id: "3",
        name: "Office Cleaning",
        category: "Commercial",
        description: "Professional office cleaning service",
        baseRate: "1200",
        priceUnit: "per hour",
        estimatedDuration: "2-3 hours",
        isActive: true,
      },
    ],
    profile: {
      businessName: "Juan's Professional Cleaning",
      serviceDescription: "With over 8 years of professional cleaning experience, I take pride in delivering exceptional service to every client.",
      yearsExperience: "8",
      coverPhotoUrl: "https://images.unsplash.com/photo-1640963269654-3fe248c5fba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdyYWRpZW50JTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzM5MzU3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      profilePhotoUrl: "https://images.unsplash.com/photo-1770392988936-dc3d8581e0c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMG1hbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzM4OTQ1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    availability: {
      "Monday": {
        available: true,
        startTime: "08:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      },
      "Tuesday": {
        available: true,
        startTime: "08:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      },
      "Wednesday": {
        available: true,
        startTime: "08:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      },
      "Thursday": {
        available: true,
        startTime: "08:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      },
      "Friday": {
        available: true,
        startTime: "08:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      },
      "Saturday": {
        available: false,
        startTime: "08:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      },
      "Sunday": {
        available: false,
        startTime: "08:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      },
    },
  });

  const addBlockedDates = (dates: string[]) => {
    setProviderData((prev) => ({
      ...prev,
      blockedDates: [...new Set([...prev.blockedDates, ...dates])],
    }));
  };

  const removeBlockedDate = (date: string) => {
    setProviderData((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== date),
    }));
  };

  const updateProfile = (updates: Partial<ProviderProfile>) => {
    setProviderData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  };

  return (
    <ProviderDataContext.Provider
      value={{
        providerData,
        setProviderData,
        blockedDates: providerData.blockedDates,
        addBlockedDates,
        removeBlockedDate,
        services: providerData.services,
        setServices: (services) =>
          setProviderData((prev) => ({ ...prev, services: services })),
        profile: providerData.profile,
        updateProfile,
      }}
    >
      {children}
    </ProviderDataContext.Provider>
  );
}

export function useProviderData() {
  const context = useContext(ProviderDataContext);
  if (context === undefined) {
    throw new Error("useProviderData must be used within a ProviderDataProvider");
  }
  return context;
}
