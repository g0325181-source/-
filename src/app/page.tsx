"use client";

import { useState } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import AlertLogPage from './components/AlertLogPage';
import { mockFacilityData, Floor } from './components/mockData';
import { toast } from 'sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [floors, setFloors] = useState<Floor[]>(mockFacilityData.floors);

  const handleSaveSettings = (updatedFloors: Floor[]) => {
    setFloors(updatedFloors);
    setShowSettings(false);
    toast.success('設定を保存しました');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      ) : showSettings ? (
        <SettingsPage 
          floors={floors}
          onSave={handleSaveSettings}
          onBack={() => setShowSettings(false)}
        />
      ) : showLogs ? (
        <AlertLogPage 
          onBack={() => setShowLogs(false)}
        />
      ) : (
        <Dashboard 
          floors={floors}
          onLogout={() => setIsAuthenticated(false)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenLogs={() => setShowLogs(true)}
        />
      )}
    </div>
  );
}