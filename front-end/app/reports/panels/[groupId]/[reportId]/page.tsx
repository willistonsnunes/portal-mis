import { PbiEmbedViewer } from "@/components/reports/panels/embed-viewer"

export default async function ReportViewerPage({
  params,
}: {
  params: Promise<{ groupId: string; reportId: string }>
}) {
  const { groupId, reportId } = await params
  return <PbiEmbedViewer groupId={groupId} reportId={reportId} />
}
