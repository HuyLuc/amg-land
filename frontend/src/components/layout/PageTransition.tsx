import type { ReactNode } from "react";
import type { Page } from "../../app/types";

type PageTransitionProps = {
  children: ReactNode;
  page: Page;
};

export function PageTransition({ children, page }: PageTransitionProps) {
  return (
    <div className="page-transition" key={page}>
      {children}
    </div>
  );
}

