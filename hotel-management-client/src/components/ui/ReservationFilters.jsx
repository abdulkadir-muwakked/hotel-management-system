import Select from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ReservationFilters({
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
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        type="text"
        placeholder="Search by room, customer, broker..."
        className="w-48"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Select value={type} onValueChange={setType} className="w-48">
        <option value="">All Types</option>
        <option value="student_male">Student Male</option>
        <option value="student_female">Student Female</option>
        <option value="medical_male">Medical Male</option>
        <option value="medical_female">Medical Female</option>
        <option value="customer">Customer</option>
      </Select>
      <Input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-36"
      />
      <Input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-36"
      />
      {onAddReservation && (
        <Button onClick={onAddReservation}>Add New Reservation</Button>
      )}
    </div>
  );
}
