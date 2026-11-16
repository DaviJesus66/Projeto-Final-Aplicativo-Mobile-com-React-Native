import React from 'react';
import { ThemeProvider } from './src/store/theme-context';
import { AuthProvider } from './src/store/auth-context';
import { WorkoutsContextProvider } from './src/store/workouts-context';
import { MeasuresContextProvider } from './src/store/measures-context';
import Navegacao from './src/navigation/Navegacao';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkoutsContextProvider>
          <MeasuresContextProvider>
            <Navegacao />
          </MeasuresContextProvider>
        </WorkoutsContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}