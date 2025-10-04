export default function CallDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Call Details - {params.id}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Call details and transcript...</p>
      </div>
    </div>
  );
}
