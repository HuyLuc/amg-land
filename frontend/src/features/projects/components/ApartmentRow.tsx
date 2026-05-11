import { Bath, BedDouble } from "lucide-react";
import type { Apartment } from "../../../types/domain";
import { apartmentStatusLabel } from "../utils/projectFormatters";

type ApartmentRowProps = {
  apartment: Apartment;
};

export function ApartmentRow({ apartment }: ApartmentRowProps) {
  return (
    <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr] items-center border-t border-slate-200 px-4 py-4 text-sm">
      <div>
        <div className="font-semibold text-slate-950">{apartment.code}</div>
        <div className="mt-1 flex gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={14} />
            {apartment.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={14} />
            {apartment.bathrooms}
          </span>
        </div>
      </div>
      <span>{apartment.area} m2</span>
      <span>{apartment.direction}</span>
      <span
        className={`rounded px-2 py-1 text-xs font-semibold ${
          apartment.status === "available"
            ? "bg-emerald-50 text-emerald-700"
            : apartment.status === "reserved"
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-500"
        }`}
      >
        {apartmentStatusLabel[apartment.status]}
      </span>
    </div>
  );
}

