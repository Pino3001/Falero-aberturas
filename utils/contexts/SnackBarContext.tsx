// SnackbarContext.tsx
import React, { createContext, useState, useMemo } from 'react';
import { Snackbar } from 'react-native-paper';

type SnackbarContextType = {
  showSnackbar: (message: string, duration?: number) => void;
};

export const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
});

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(4000); // Default: 4 segundos

  const showSnackbar = (msg: string, durationMs = 4000) => {
    setMessage(msg);
    setDuration(durationMs);
    setVisible(true);
  };

  // Memoiza el contexto para evitar renders innecesarios
  const contextValue = useMemo(() => ({ showSnackbar }), []);

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={duration}
        action={{ label: 'OK' }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}