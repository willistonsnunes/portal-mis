import { PanelsReportList } from "@/components/reports/panels/report-list"

export default async function CustomerPanelsPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  return <PanelsReportList groupId={groupId} />
}
