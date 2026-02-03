"use client"

import { DetailsProvider } from "@/lib/details-context"
import GenericSearchPage from "@/components/reports/details/search"
import { knowledgesFilters } from "@/components/reports/details/report-filters"

export default function KnowledgesPage() {
  return (
    <DetailsProvider>
      <GenericSearchPage
        endpoint="knowledges"
        title="Conhecimentos"
        filters={knowledgesFilters}
        exportFileName="conhecimentos.xlsx"
      />
    </DetailsProvider>
  )
}