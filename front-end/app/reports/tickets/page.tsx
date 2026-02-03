"use client"

import { DetailsProvider } from "@/lib/details-context"
import GenericSearchPage from "@/components/reports/details/search"
import { ticketsFilters } from "@/components/reports/details/report-filters"

export default function TicketsPage() {
  return (
    <DetailsProvider>
      <GenericSearchPage
        endpoint="tickets"
        title="Tickets"
        filters={ticketsFilters}
        exportFileName="tickets.xlsx"
      />
    </DetailsProvider>
  )
}