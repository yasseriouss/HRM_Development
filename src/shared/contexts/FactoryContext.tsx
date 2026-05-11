import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "../lib/auth";

interface Factory {
  id: string;
  name: string;
  location: string | null;
}

interface FactoryContextType {
  activeFactoryId: string | null;
  setActiveFactoryId: (id: string | null) => void;
  activeFactory: Factory | null;
  factories: Factory[];
  isLoading: boolean;
}

export const FactoryContext = createContext<FactoryContextType>({
  activeFactoryId: null,
  setActiveFactoryId: () => {},
  activeFactory: null,
  factories: [],
  isLoading: false,
});

export function FactoryProvider({ children }: { children: ReactNode }) {
  const headers = getAuthHeaders();
  
  const [activeFactoryId, setActiveFactoryIdState] = useState<string | null>(() => {
    return localStorage.getItem("activeFactoryId");
  });

  const { data: factories = [], isLoading } = useQuery<Factory[]>({
    queryKey: ["factories-list"],
    queryFn: async () => {
      const res = await fetch("/api/factories", { headers });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const setActiveFactoryId = (id: string | null) => {
    setActiveFactoryIdState(id);
    if (id) {
      localStorage.setItem("activeFactoryId", id);
    } else {
      localStorage.removeItem("activeFactoryId");
    }
  };

  // Set default factory if none active and data loaded
  useEffect(() => {
    if (!activeFactoryId && factories.length > 0) {
      // Prioritize Woodworking Factory as default if it exists
      const woodworking = factories.find(f => f.name.includes("Woodworking"));
      setActiveFactoryId(woodworking?.id || factories[0].id);
    }
  }, [factories, activeFactoryId]);

  const activeFactory = factories.find((f) => f.id === activeFactoryId) || null;

  return (
    <FactoryContext.Provider
      value={{
        activeFactoryId,
        setActiveFactoryId,
        activeFactory,
        factories,
        isLoading,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
}

export function useFactory() {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error("useFactory must be used within a FactoryProvider");
  }
  return context;
}
