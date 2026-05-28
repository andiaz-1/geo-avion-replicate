import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (!sess) { setIsAdmin(false); setLoading(false); return; }
      setTimeout(async () => {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", sess.user.id);
        setIsAdmin(!!data?.some((r: any) => r.role === "admin"));
        setLoading(false);
      }, 0);
    });
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      if (!sess) { setIsAdmin(false); setLoading(false); return; }
      supabase.from("user_roles").select("role").eq("user_id", sess.user.id).then(({ data }) => {
        setIsAdmin(!!data?.some((r: any) => r.role === "admin"));
        setLoading(false);
      });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, isAdmin, loading };
}
