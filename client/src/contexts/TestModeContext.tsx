import { createContext, useContext, useState, ReactNode } from "react";

interface TestModeContextType {
  testMode: boolean;
  setTestMode: (value: boolean) => void;
}

const TestModeContext = createContext<TestModeContextType>({
  testMode: true, // Default ON until launch
  setTestMode: () => {},
});

export function TestModeProvider({ children }: { children: ReactNode }) {
  const [testMode, setTestMode] = useState(true); // Default ON until launch
  
  return (
    <TestModeContext.Provider value={{ testMode, setTestMode }}>
      {children}
    </TestModeContext.Provider>
  );
}

export function useTestMode() {
  return useContext(TestModeContext);
}
