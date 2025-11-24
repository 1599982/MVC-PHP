import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Candidate,
  Admin,
  initialCandidates,
  initialAdmins,
} from "@/data/mockData";

interface UserSession {
  dni: string;
  votedPresidencia: string | boolean;
  votedAlcaldia: string | boolean;
}

interface AdminSession {
  dni: string;
  name: string;
}

interface AppContextType {
  // User state
  userSession: UserSession | null;
  loginUser: (dni: string, votedPresidentDni?: string | null, votedMayorDni?: string | null) => void;
  logoutUser: () => void;

  // Admin state
  adminSession: AdminSession | null;
  loginAdmin: (dni: string, name: string) => void;
  registerAdmin: (name: string, email: string, password: string) => boolean;
  logoutAdmin: () => void;

  // Candidates
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, "id" | "votes">) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;

  // Voting
  voteForCandidate: (candidateId: string) => void;
  getUserVotes: () => { presidencia: string | null; alcaldia: string | null };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    const storedCandidates = localStorage.getItem("candidates");
    const storedAdmins = localStorage.getItem("admins");
    const storedUser = localStorage.getItem("userSession");
    const storedAdmin = localStorage.getItem("adminSession");

    if (storedCandidates) {
      try {
        const parsed = JSON.parse(storedCandidates) as Candidate[];
        // Merge stored candidates with initialCandidates so newly added mock entries appear
        const map = new Map<string, Candidate>();
        // First, add stored (preserve votes and any admin edits)
        parsed.forEach((c) => map.set(c.id, c));
        // Then add any initial candidates that aren't present yet
        initialCandidates.forEach((ic) => {
          if (!map.has(ic.id)) map.set(ic.id, ic);
        });
        setCandidates(Array.from(map.values()));
      } catch (e) {
        // Fallback to initialCandidates if parsing fails
        setCandidates(initialCandidates);
      }
    } else {
      setCandidates(initialCandidates);
    }
    if (storedAdmins) {
      try {
        const parsedAdmins = JSON.parse(storedAdmins) as Admin[];
        // Merge stored admins with initialAdmins so default admin remains available
        const am = new Map<string, Admin>();
        parsedAdmins.forEach((a) => am.set(a.email, a));
        initialAdmins.forEach((ia) => {
          if (!am.has(ia.email)) am.set(ia.email, ia);
        });
        setAdmins(Array.from(am.values()));
      } catch (e) {
        setAdmins(initialAdmins);
      }
    } else {
      setAdmins(initialAdmins);
    }

    if (storedUser) {
      setUserSession(JSON.parse(storedUser));
    }
    if (storedAdmin) {
      setAdminSession(JSON.parse(storedAdmin));
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (candidates.length > 0) {
      localStorage.setItem("candidates", JSON.stringify(candidates));
    }
  }, [candidates]);

  useEffect(() => {
    if (admins.length > 0) {
      localStorage.setItem("admins", JSON.stringify(admins));
    }
  }, [admins]);

  useEffect(() => {
    if (userSession) {
      localStorage.setItem("userSession", JSON.stringify(userSession));
    } else {
      localStorage.removeItem("userSession");
    }
  }, [userSession]);

  useEffect(() => {
    if (adminSession) {
      localStorage.setItem("adminSession", JSON.stringify(adminSession));
    } else {
      localStorage.removeItem("adminSession");
    }
  }, [adminSession]);

  // User functions
  const loginUser = (
    dni: string,
    votedPresidentDni?: string | null,
    votedMayorDni?: string | null
  ) => {
    const session: UserSession = {
      dni,
      votedPresidencia: votedPresidentDni || false,
      votedAlcaldia: votedMayorDni || false,
    };

    setUserSession(session);
    try {
      localStorage.setItem("userSession", JSON.stringify(session));
    } catch (e) {
      // Silenciosa si el almacenamiento falla (por ejemplo, modo privado)
      // Mantiene la sesión en memoria para la sesión actual.
      console.warn("No se pudo persistir userSession:", e);
    }
  };

  const logoutUser = () => {
    setUserSession(null);
    try {
      localStorage.removeItem("userSession");
    } catch (e) {
      console.warn("No se pudo remover userSession:", e);
    }
  };

  // Admin functions
  const loginAdmin = (dni: string, name: string): void => {
    setAdminSession({ dni, name });
  };

  const registerAdmin = (
    name: string,
    email: string,
    password: string
  ): boolean => {
    if (admins.find((a) => a.email === email)) {
      return false;
    }
    const newAdmin = { name, email, password };
    setAdmins([...admins, newAdmin]);
    setAdminSession({ email, name });
    return true;
  };

  const logoutAdmin = () => {
    setAdminSession(null);
  };

  // Candidate functions
  const addCandidate = (candidate: Omit<Candidate, "id" | "votes">) => {
    const newCandidate: Candidate = {
      ...candidate,
      id: `${candidate.category[0]}${Date.now()}`,
      votes: 0,
    };
    setCandidates([...candidates, newCandidate]);
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(
      candidates.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCandidate = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  // Voting functions
  const voteForCandidate = (candidateDni: string) => {
    if (!userSession) return;

    const votesKey = `votes_${userSession.dni}`;
    const existingVotes = localStorage.getItem(votesKey);
    const parsedVotes = existingVotes ? JSON.parse(existingVotes) : {};

    // Determinar la categoría basándose en si ya votó
    // Si ya votó por presidente, este debe ser un voto de alcalde
    // Si no ha votado por presidente, este es un voto de presidente
    let category: "presidencia" | "alcaldia";
    
    if (!userSession.votedPresidencia) {
      category = "presidencia";
    } else if (!userSession.votedAlcaldia) {
      category = "alcaldia";
    } else {
      // Ya votó en ambas categorías
      return;
    }

    parsedVotes[category] = candidateDni;
    localStorage.setItem(votesKey, JSON.stringify(parsedVotes));

    setUserSession({
      ...userSession,
      votedPresidencia:
        category === "presidencia" ? candidateDni : userSession.votedPresidencia,
      votedAlcaldia:
        category === "alcaldia" ? candidateDni : userSession.votedAlcaldia,
    });
  };

  const getUserVotes = () => {
    if (!userSession) return { presidencia: null, alcaldia: null };

    const votesKey = `votes_${userSession.dni}`;
    const existingVotes = localStorage.getItem(votesKey);
    const parsedVotes = existingVotes ? JSON.parse(existingVotes) : {};

    return {
      presidencia: parsedVotes.presidencia || null,
      alcaldia: parsedVotes.alcaldia || null,
    };
  };

  return (
    <AppContext.Provider
      value={{
        userSession,
        loginUser,
        logoutUser,
        adminSession,
        loginAdmin,
        registerAdmin,
        logoutAdmin,
        candidates,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        voteForCandidate,
        getUserVotes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
