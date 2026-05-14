import { useMemo, useState } from "react";
import type { Project } from "../../../types/domain";

export function useProjectFilters(projects: Project[]) {
  const [district, setDistrict] = useState("Tất cả");
  const [budget, setBudget] = useState("Tất cả");
  const [bedrooms, setBedrooms] = useState("Tất cả");

  const districts = useMemo(() => ["Tất cả", ...new Set(projects.map((project) => project.district))], [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const districtMatch = district === "Tất cả" || project.district === district;
      const budgetMatch =
        budget === "Tất cả" ||
        (budget === "Dưới 3 tỷ" && project.priceFrom < 3_000_000_000) ||
        (budget === "3 - 5 tỷ" && project.priceFrom >= 3_000_000_000 && project.priceFrom <= 5_000_000_000) ||
        (budget === "Trên 5 tỷ" && project.priceFrom > 5_000_000_000);
      const bedroomMatch =
        bedrooms === "Tất cả" ||
        project.apartments.some((apartment) => `${apartment.bedrooms} PN` === bedrooms);

      return districtMatch && budgetMatch && bedroomMatch;
    });
  }, [bedrooms, budget, district, projects]);

  return {
    bedrooms,
    budget,
    district,
    districts,
    filteredProjects,
    setBedrooms,
    setBudget,
    setDistrict
  };
}

export type ProjectFilters = ReturnType<typeof useProjectFilters>;
