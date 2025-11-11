import prisma from "@/lib/prisma";

async function getRequests() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  try {
    return await prisma.trailerRequest.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    return null;
  }
}

export default async function RequestsPage() {
  const requests = await getRequests();

  if (!requests) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Requests</h1>
        <p className="text-gray-600">Database not connected. Running in console mode.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Trailer Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Manufacturer</th>
              <th className="border p-2 text-left">Purpose</th>
              <th className="border p-2 text-left">VIN</th>
              <th className="border p-2 text-left">Message</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="border p-2">{new Date(req.createdAt).toLocaleDateString()}</td>
                <td className="border p-2">{req.manufacturer}</td>
                <td className="border p-2">{req.purpose}</td>
                <td className="border p-2">{req.vin || "-"}</td>
                <td className="border p-2 max-w-xs truncate">{req.message}</td>
                <td className="border p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    req.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    req.status === "reviewed" ? "bg-blue-100 text-blue-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
