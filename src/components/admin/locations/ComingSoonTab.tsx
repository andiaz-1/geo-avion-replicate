import { Card } from "@/components/ui/card";

export default function ComingSoonTab({ name }: { name: string }) {
  return (
    <Card className="p-10 text-center">
      <h3 className="font-display text-lg mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground">
        Coming in the next batch. The database is ready — UI ships next.
      </p>
    </Card>
  );
}
