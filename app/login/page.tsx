"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdmin } from "@/lib/loginActions";
import { IconLock, IconShieldCheck, IconEye, IconEyeOff } from "@/app/components/Icons";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/data-entry";

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await loginAdmin({ usernameInput, passwordInput });
    setIsLoading(false);

    if (res.success) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setErrorMsg(res.error || "Invalid credentials.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "440px",
        margin: "3rem auto",
        width: "100%",
      }}
    >
      <div
        className="card glass-panel"
        style={{
          padding: "2.5rem 2rem",
          background: "#FFFFFF",
          border: "2px solid var(--accent-primary)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(79, 70, 229, 0.1)",
              color: "var(--accent-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <IconShieldCheck size={32} color="var(--accent-primary)" />
          </div>
          <h1 className="h2" style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>
            Admin Portal Access
          </h1>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            MUC CS Result & Academic Data Management
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid var(--status-error)",
              borderRadius: "var(--radius-md)",
              color: "var(--status-error)",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="input-label" style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.4rem", display: "block" }}>
              Admin Username
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. admin"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
              disabled={isLoading}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label className="input-label" style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.4rem", display: "block" }}>
              Admin Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                disabled={isLoading}
                style={{ width: "100%", paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                }}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{
              width: "100%",
              marginTop: "0.75rem",
              padding: "0.85rem",
              fontSize: "1rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <IconLock size={18} color="#FFFFFF" />
            <span>{isLoading ? "Authenticating..." : "Authorize Admin Session"}</span>
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          🔒 Protected by Encrypted HTTP-Only Admin Token
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "3rem" }}>Loading portal...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
