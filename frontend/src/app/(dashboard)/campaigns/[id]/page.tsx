export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Campaign Details - {params.id}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Campaign details and analytics...</p>
      </div>
    </div>
  );
}
