import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, MessageSquare, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Discussion {
  id: string;
  event_id: string;
  title: string;
  author_name?: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
  audience?: string | null;
}

interface DiscussionsProps {
  eventId: string;
  audience?: "client" | "staff";
  title?: string;
  description?: string;
}

export default function Discussions({
  eventId,
  audience = "client",
  title = "Discussions",
  description,
}: DiscussionsProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [authorName, setAuthorName] = useState("");

  const { data: discussions = [] } = useQuery({
    queryKey: ["discussions", eventId, audience],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select("*")
        .eq("event_id", eventId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq("audience" as any, audience)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Discussion[];
    },
  });

  const createDiscussion = useMutation({
    mutationFn: async ({
      title,
      message,
      author,
    }: {
      title: string;
      message: string;
      author: string;
    }) => {
      const { data: disc, error: e1 } = await supabase
        .from("discussions")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ event_id: eventId, title, author_name: author, message_count: 1, audience } as any)
        .select()
        .single();
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("discussion_messages").insert({
        discussion_id: disc.id,
        event_id: eventId,
        body: message,
        author_name: author,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audience,
      } as any);
      if (e2) throw e2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", eventId, audience] });
      setShowCreate(false);
      setNewTitle("");
      setNewMessage("");
      setAuthorName("");
      toast.success("Discussion created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = discussions.filter(
    (d) =>
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.author_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Create New Discussion
        </Button>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
      )}

      {showCreate && (
        <div className="my-4 p-4 border border-border rounded-md bg-muted/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">New {audience === "staff" ? "Staff" : "Client"} Discussion</h4>
            <button
              onClick={() => setShowCreate(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Discussion title" />
          </div>
          <div>
            <Label>Author</Label>
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={3} />
          </div>
          <Button
            size="sm"
            disabled={!newTitle || !newMessage || createDiscussion.isPending}
            onClick={() => createDiscussion.mutate({ title: newTitle, message: newMessage, author: authorName })}
          >
            {createDiscussion.isPending ? "Creating..." : "Create Discussion"}
          </Button>
        </div>
      )}

      <div className="mt-3 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={`Search ${audience} discussions`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No {audience} discussions yet
          </div>
        ) : (
          filtered.map((disc, i) => (
            <div
              key={disc.id}
              className={`flex items-center gap-4 px-4 py-3 text-sm ${i < filtered.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                {disc.message_count || 1}
              </div>
              <div className="flex-1 font-medium">{disc.title}</div>
              <div className="text-primary text-xs w-24 shrink-0 truncate">{disc.author_name || "—"}</div>
              <div className="text-muted-foreground text-xs w-32 shrink-0">
                <span className="block">Created:</span>
                <span>{format(new Date(disc.created_at), "MMM d, yyyy")}</span>
              </div>
              <div className="text-muted-foreground text-xs w-40 shrink-0">
                <span className="block">Last activity:</span>
                <span>{format(new Date(disc.updated_at), "MMM d, h:mm a")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
