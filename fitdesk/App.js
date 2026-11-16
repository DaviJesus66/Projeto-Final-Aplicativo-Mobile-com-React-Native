import React from 'react';
import { ThemeProvider } from './src/store/theme-context';
import { AuthProvider } from './src/store/auth-context';
import { FeedbackProvider } from './src/store/feedback-context';
import { WorkoutsContextProvider } from './src/store/workouts-context';
import { MeasuresContextProvider } from './src/store/measures-context';
import Navegacao from './src/navigation/Navegacao';
import './src/services/lembrete';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FeedbackProvider>
          <WorkoutsContextProvider>
            <MeasuresContextProvider>
              <Navegacao />
            </MeasuresContextProvider>
          </WorkoutsContextProvider>
        </FeedbackProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}