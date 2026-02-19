import DashBoardPage from "@/modules/dashboard/ui/components/dashboard-view";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  return <DashBoardPage conversationId={conversationId} />;
}
