import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./mainlayout/MainLayout";
import Dashboard from "./dashboard/Dashboard";
import Transactions from "./transactions/Transactions";
import Login from "./login/Login";
import Chatbot from "./chatbot/Chatbot";

function App() {
  // State variables for storing user Name and Id
  const [isUserLoggined, setIsUserLoggined] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsUserLoggined} setUserId={setUserId} setUserName={setUserName} />} />

        {/* If user isLoggedin Routes will be loaded or else its navigates to login  */}
        {isUserLoggined ? (
          <>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<MainLayout userId={userId} setIsAuthenticated={setIsUserLoggined}><Dashboard userId={userId} userName={userName} /></MainLayout>} />
            <Route path="/transactions" element={<MainLayout userId={userId} setIsAuthenticated={setIsUserLoggined}><Transactions userId={userId} /></MainLayout>} />
            <Route path="/chatbot" element={<MainLayout userId={userId} setIsAuthenticated={setIsUserLoggined}><Chatbot /></MainLayout>} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
