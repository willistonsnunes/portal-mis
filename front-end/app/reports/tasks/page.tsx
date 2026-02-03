"use client"

import { DetailsProvider } from "@/lib/details-context"
import GenericSearchPage from "@/components/reports/details/search"
import { tasksFilters } from "@/components/reports/details/report-filters"

export default function TasksPage() {
  return (
    <DetailsProvider>
      <GenericSearchPage
        endpoint="tasks"
        title="Tarefas"
        filters={tasksFilters}
        exportFileName="tarefas.xlsx"
      />
    </DetailsProvider>
  )
}