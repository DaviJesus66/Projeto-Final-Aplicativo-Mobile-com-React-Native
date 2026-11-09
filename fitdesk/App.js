import React from 'react';
import { ThemeProvider } from './src/store/theme-context';
import { WorkoutsContextProvider } from './src/store/workouts-context';
import { MeasuresContextProvider } from './src/store/measures-context';
import Navegacao from './src/navigation/Navegacao';

export default function App() {
  return (
    <ThemeProvider>
      <WorkoutsContextProvider>
        <MeasuresContextProvider>
          <Navegacao />
        </MeasuresContextProvider>
      </WorkoutsContextProvider>
    </ThemeProvider>
  );
}
