"use client"

import { DetailsProvider } from "@/lib/details-context"
import GenericSearchPage from "@/components/reports/details/search"
import { satisfactionsFilters } from "@/components/reports/details/report-filters"

export default function SatisfactionsPage() {
  return (
    <DetailsProvider>
      <GenericSearchPage
        endpoint="satisfactions"
        title="Satisfações"
        filters={satisfactionsFilters}
        exportFileName="satisfacoes.xlsx"
      />
    </DetailsProvider>
  )
}
