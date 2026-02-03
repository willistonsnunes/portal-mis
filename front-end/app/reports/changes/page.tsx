"use client"

import { DetailsProvider } from "@/lib/details-context"
import GenericSearchPage from "@/components/reports/details/search"
import { changesFilters } from "@/components/reports/details/report-filters"

export default function ChangesPage() {
  return (
    <DetailsProvider>
      <GenericSearchPage
        endpoint="changes"
        title="Mudanças"
        filters={changesFilters}
        exportFileName="mudancas.xlsx"
      />
    </DetailsProvider>
  )
}
