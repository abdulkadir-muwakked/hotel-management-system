import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function RoomFilters({
  search,
  setSearch,
  type,
  setType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  available,
  setAvailable,
  onAddRoom,
}) {
  return (
    <div className="flex gap-2 items-center">
      <Input
        type="text"
        placeholder="Search by number or description..."
        className="w-48"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Select value={type} onValueChange={setType}>
        <option value="">All Types</option>
        <option value="student_male">Student Male</option>
        <option value="student_female">Student Female</option>
        <option value="medical_male">Medical Male</option>
        <option value="medical_female">Medical Female</option>
        <option value="customer">Customer</option>
      </Select>
      <Input
        type="number"
        placeholder="Min Price"
        className="w-24"
        value={minPrice}
        onChange={e => setMinPrice(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Max Price"
        className="w-24"
        value={maxPrice}
        onChange={e => setMaxPrice(e.target.value)}
      />
      <Select value={available} onValueChange={setAvailable}>
        <option value="">All Statuses</option>
        <option value="clean">Clean</option>
        <option value="dirty">Dirty</option>
        <option value="occupied">Occupied</option>
        <option value="available">Available</option>
      </Select>
      {onAddRoom && (
        <Button onClick={onAddRoom}>Add New Room</Button>
      )}
    </div>
  );
}
