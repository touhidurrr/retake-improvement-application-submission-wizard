"use client";

import { useEffect, useState } from "react";
import PasswordForm from "./PasswordForm";
import ReportContent from "./ReportContent";
import { checkAuth } from "../actions";

export default function ReportPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuth = await checkAuth();
        setIsAuthenticated(isAuth);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <ReportContent />;
} 