// PRE-LAUNCH: auth is disabled. Everyone is treated as admin so the CRM
// works without sign-in. Re-enable real auth before going live.
export function useAdminAuth() {
  return { session: { user: { id: "anon" } } as any, isAdmin: true, loading: false };
}
