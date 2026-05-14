import { Home, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { SelectField } from "../../../components/ui/SelectField";
import { bedroomOptions, budgetOptions } from "../utils/projectFormatters";

type QuickSearchProps = {
  districts: string[];
  district: string;
  budget: string;
  bedrooms: string;
  onDistrictChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onBedroomsChange: (value: string) => void;
  onSearch: () => void;
};

export function QuickSearch({
  districts,
  district,
  budget,
  bedrooms,
  onDistrictChange,
  onBudgetChange,
  onBedroomsChange,
  onSearch
}: QuickSearchProps) {
  return (
    <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-5 lg:px-8">
      <div className="premium-panel relative grid gap-4 overflow-hidden rounded p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <span className="absolute inset-x-0 top-0 h-1 bg-brand-900" />
        <SelectField icon={<MapPin size={18} />} label="Khu vực" onChange={onDistrictChange} options={districts} value={district} />
        <SelectField icon={<SlidersHorizontal size={18} />} label="Ngân sách" onChange={onBudgetChange} options={budgetOptions} value={budget} />
        <SelectField icon={<Home size={18} />} label="Số phòng" onChange={onBedroomsChange} options={bedroomOptions} value={bedrooms} />
        <button className="btn-primary min-h-16 justify-center px-7" onClick={onSearch} type="button">
          <Search size={18} />
          Tìm kiếm
        </button>
      </div>
    </section>
  );
}
