import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Trash2, Phone, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Contact {
  id: string;
  event_id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email_1?: string | null;
  email_2?: string | null;
  company_name?: string | null;
  position?: string | null;
  is_main?: boolean | null;
}

type ContactDraft = Omit<Contact, "id" | "event_id">;

const EMPTY: ContactDraft = {
  first_name: "",
  last_name: "",
  phone: "",
  email_1: "",
  email_2: "",
  company_name: "",
  position: "",
};

function ContactFields({ contact, onChange }: { contact: ContactDraft; onChange: (c: ContactDraft) => void }) {
  const set = (k: keyof ContactDraft, v: string) => onChange({ ...contact, [k]: v });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <Label>First Name</Label>
        <Input value={contact.first_name || ""} onChange={(e) => set("first_name", e.target.value)} />
      </div>
      <div>
        <Label>Last Name</Label>
        <Input value={contact.last_name || ""} onChange={(e) => set("last_name", e.target.value)} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={contact.phone || ""} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div>
        <Label>Email 1</Label>
        <Input value={contact.email_1 || ""} onChange={(e) => set("email_1", e.target.value)} />
      </div>
      <div>
        <Label>Email 2</Label>
        <Input value={contact.email_2 || ""} onChange={(e) => set("email_2", e.target.value)} />
      </div>
      <div>
        <Label>Company</Label>
        <Input value={contact.company_name || ""} onChange={(e) => set("company_name", e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Label>Position</Label>
        <Input value={contact.position || ""} onChange={(e) => set("position", e.target.value)} />
      </div>
    </div>
  );
}

function ContactRow({ contact, eventId, onDelete }: { contact: Contact; eventId: string; onDelete: () => void }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ContactDraft>(contact);
  const update = useMutation({
    mutationFn: async (data: ContactDraft) => {
      const { error } = await supabase.from("event_contacts").update(data).eq("id", contact.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", eventId] });
      setEditing(false);
      toast.success("Contact updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-foreground uppercase tracking-wide text-sm">
            {contact.first_name} {contact.last_name}
          </div>
          {(contact.position || contact.company_name) && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {contact.position}
              {contact.position && contact.company_name ? " · " : ""}
              {contact.company_name}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing((e) => !e)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Edit contact"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
            aria-label="Delete contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!editing && (
        <div className="space-y-1 text-sm text-muted-foreground mt-2">
          {contact.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.email_1 && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>{contact.email_1}</span>
            </div>
          )}
          {contact.email_2 && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>{contact.email_2}</span>
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="mt-3 space-y-3">
          <ContactFields contact={form} onChange={setForm} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => update.mutate(form)} disabled={update.isPending}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setForm(contact);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContactsCard({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [newContact, setNewContact] = useState<ContactDraft>(EMPTY);

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_contacts")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Contact[];
    },
  });

  const createContact = useMutation({
    mutationFn: async (data: ContactDraft) => {
      const { error } = await supabase.from("event_contacts").insert({ ...data, event_id: eventId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", eventId] });
      setNewContact(EMPTY);
      toast.success("Contact added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts", eventId] }),
  });

  return (
    <div className="bg-card border border-border rounded-md p-6">
      <h3 className="font-semibold mb-4 text-foreground">Contacts</h3>
      <div className="space-y-3">
        {contacts.map((c, i) => (
          <div key={c.id}>
            {i === 0 && (
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Main Contact
              </div>
            )}
            {i === 1 && (
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 mt-4">
                Additional Contacts
              </div>
            )}
            <ContactRow contact={c} eventId={eventId} onDelete={() => deleteContact.mutate(c.id)} />
          </div>
        ))}

        <div className="border border-border rounded-md p-4 bg-muted/40 space-y-3">
          <ContactFields contact={newContact} onChange={setNewContact} />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => createContact.mutate(newContact)}
              disabled={createContact.isPending || !newContact.first_name}
            >
              Save Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
