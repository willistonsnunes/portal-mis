"use client"

import { DetailsProvider } from "@/lib/details-context"
import GenericSearchPage from "@/components/reports/details/search"
import { problemsFilters } from "@/components/reports/details/report-filters"

export default function ProblemsPage() {
  return (
    <DetailsProvider>
      <GenericSearchPage
        endpoint="problems"
        title="Problemas"
        filters={problemsFilters}
        exportFileName="problemas.xlsx"
      />
    </DetailsProvider>
  )
}