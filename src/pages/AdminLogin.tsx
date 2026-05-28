import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLogin() {
  const { session, isAdmin, loading } = useAdminAuth();
export default function AdminLogin() {
  const { session, isAdmin, loading } = useAdminAuth();
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  if (!loading && session && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "create") {
      const { data, error } = await supabase.functions.invoke("admin-bootstrap", { body: { email, password } });
      if (error || !data?.success) { setBusy(false); return toast.error(data?.error || error?.message || "Failed"); }
      const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (e2) return toast.error(e2.message);
      toast.success("Coordinator account created");
      nav("/admin"); return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    nav("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-sm p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Coordinator {mode === "create" ? "Setup" : "Login"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Salumeria 104 Weston</p>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Working…" : mode === "create" ? "Create account" : "Sign in"}</Button>
        <button type="button" className="text-xs text-muted-foreground underline w-full text-center" onClick={() => setMode(mode === "signin" ? "create" : "signin")}>
          {mode === "signin" ? "First time? Create the coordinator account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
}
