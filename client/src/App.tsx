import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthService, UserProfile } from './services/supabase';
import { HomeScreen } from './pages/HomeScreen';
import { RoomController } from './pages/RoomController';
import { AdminDashboard } from './pages/AdminDashboard';
import { App as CapApp } from '@capacitor/app';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(AuthService.getCurrentProfile());

  useEffect(() => {
    // Listen for Capacitor native deep links (e.g. guessthe11://join?room=AB12CD)
    const setupDeepLinks = async () => {
      try {
        CapApp.addListener('appUrlOpen', (event) => {
          const url = new URL(event.url);
          const roomCode = url.searchParams.get('room');
          if (roomCode) {
            window.location.href = `/join?room=${roomCode}`;
          }
        });
      } catch (e) {
        // Not running in Capacitor native context
      }
    };

    setupDeepLinks();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              profile={profile}
              onProfileUpdated={(p) => setProfile(p)}
            />
          }
        />
        <Route
          path="/join"
          element={<RoomController profile={profile} />}
        />
        <Route
          path="/room/:code"
          element={<RoomController profile={profile} />}
        />
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
