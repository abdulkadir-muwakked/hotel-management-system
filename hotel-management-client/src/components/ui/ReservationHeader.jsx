import { useRouter } from "next/navigation";
import ReservationFilters from "@/components/ui/ReservationFilters";

export default function ReservationHeader({
  search,
  setSearch,
  type,
  setType,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onAddReservation,
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold">Reservations Management</h2>
        <p className="text-sm text-muted-foreground">
          View and manage all reservations and their details.
        </p>
      </div>
      <ReservationFilters
        search={search}
        setSearch={setSearch}
        type={type}
        setType={setType}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onAddReservation={
          onAddReservation || (() => router.push("Reservations/create"))
        }
      />
    </div>
  );
}
