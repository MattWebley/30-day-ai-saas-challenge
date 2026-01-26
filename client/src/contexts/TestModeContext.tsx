import { createContext, useContext, useState, ReactNode } from "react";

interface TestModeContextType {
  testMode: boolean;
  setTestMode: (value: boolean) => void;
}

const TestModeContext = createContext<TestModeContextType>({
  testMode: false,
  setTestMode: () => {},
});

export function TestModeProvider({ children }: { children: ReactNode }) {
  const [testMode, setTestMode] = useState(false);
  
  return (
    <TestModeContext.Provider value={{ testMode, setTestMode }}>
      {children}
    </TestModeContext.Provider>
  );
}

export function useTestMode() {
  return useContext(TestModeContext);
}
