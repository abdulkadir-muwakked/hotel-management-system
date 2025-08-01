"use client";
import BrokersTable from "./BrokersTable";

export default function BrokersPage() {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Brokers Management</h2>
      <p className="text-sm text-muted-foreground mb-4">
        View and manage all brokers and their reservations statistics.
      </p>
      <BrokersTable />
    </div>
  );
}
