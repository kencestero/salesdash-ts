import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

export default async function ManagerRequestsPage() {
  const session = await getServerSession(authOptions);
  const managerId = session?.user?.id;

  if (!managerId) return <div className="p-6">Not authorized</div>;

  const rows = await prisma.requestLog.findMany({
    where: { managerId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">My Team's Requests</h1>

      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="min-w-full divide-y divide-neutral-800">
          <thead className="bg-neutral-900/70 text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Rep</th>
              <th className="px-4 py-3 text-left">Purpose</th>
              <th className="px-4 py-3 text-left">Manufacturer</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 bg-neutral-950 text-sm">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{format(r.createdAt, "MMM d, HH:mm")}</td>
                <td className="px-4 py-3">
                  {r.submittedByName}{" "}
                  <span className="text-neutral-400 text-xs">{r.repCode}</span>
                </td>
                <td className="px-4 py-3">{r.purpose}</td>
                <td className="px-4 py-3">{r.manufacturer}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.status === "SENT"
                        ? "text-emerald-400"
                        : r.status === "FAILED"
                        ? "text-red-400"
                        : "text-amber-400"
                    }
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-neutral-500"
                >
                  No team requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
