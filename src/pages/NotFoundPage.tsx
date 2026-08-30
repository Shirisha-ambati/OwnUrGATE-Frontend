import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="text-8xl font-black text-bg-elevated">404</div>
      <h2 className="text-text-primary text-xl font-bold">Page Not Found</h2>
      <p className="text-text-muted text-sm">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/")} className="btn-primary mt-2">Go to Dashboard</button>
    </div>
  );
}
