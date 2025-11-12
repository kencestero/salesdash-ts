/**
 * Export Utilities
 * Helper functions for exporting data to CSV/Excel
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return "";

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Build CSV rows
  const csvRows = [
    // Header row
    csvHeaders.join(","),
    // Data rows
    ...data.map((row) =>
      csvHeaders.map((header) => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(",")
    ),
  ];

  return csvRows.join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export team performance to CSV
 */
export function exportTeamPerformanceCSV(teamData: any[]) {
  const csvData = teamData.map((rep) => ({
    "Rep Name": rep.repName,
    "Total Leads": rep.totalLeads,
    "Hot Leads": rep.hotLeads,
    "Won Leads": rep.wonLeads,
    "Applied Leads": rep.appliedLeads,
    "Average Score": rep.avgScore,
    "Conversion Rate": rep.conversionRate + "%",
    "Apply Rate": rep.applyRate + "%",
    "Stale Leads": rep.staleLeads,
  }));

  const csv = arrayToCSV(csvData);
  const filename = `team-performance-${new Date().toISOString().split("T")[0]}.csv`;

  downloadCSV(csv, filename);
}

/**
 * Export hot leads to CSV
 */
export function exportHotLeadsCSV(hotLeads: any[]) {
  const csvData = hotLeads.map((lead) => ({
    Name: lead.name,
    Phone: lead.phone || "",
    "Lead Score": lead.leadScore,
    Temperature: lead.temperature,
    Status: lead.status,
    "Days in Stage": lead.daysInStage,
    "Sales Rep": lead.salesRepName || "",
  }));

  const csv = arrayToCSV(csvData);
  const filename = `hot-leads-${new Date().toISOString().split("T")[0]}.csv`;

  downloadCSV(csv, filename);
}

/**
 * Export dashboard summary to CSV
 */
export function exportDashboardSummaryCSV(dashboardData: any) {
  const summaryData = [
    { Metric: "Total Leads", Value: dashboardData.overview.totalLeads },
    { Metric: "New Leads Today", Value: dashboardData.overview.newLeadsToday },
    { Metric: "Applied Today", Value: dashboardData.overview.appliedToday },
    {
      Metric: "Avg Response Time (min)",
      Value: dashboardData.overview.avgResponseTime || "N/A",
    },
    { Metric: "", Value: "" }, // Blank row
    { Metric: "Hot Leads", Value: dashboardData.leadsByTemperature.hot || 0 },
    { Metric: "Warm Leads", Value: dashboardData.leadsByTemperature.warm || 0 },
    { Metric: "Cold Leads", Value: dashboardData.leadsByTemperature.cold || 0 },
    { Metric: "Dead Leads", Value: dashboardData.leadsByTemperature.dead || 0 },
    { Metric: "", Value: "" }, // Blank row
    { Metric: "New", Value: dashboardData.leadsByStatus.new || 0 },
    { Metric: "Contacted", Value: dashboardData.leadsByStatus.contacted || 0 },
    { Metric: "Qualified", Value: dashboardData.leadsByStatus.qualified || 0 },
    { Metric: "Applied", Value: dashboardData.leadsByStatus.applied || 0 },
    { Metric: "Approved", Value: dashboardData.leadsByStatus.approved || 0 },
    { Metric: "Won", Value: dashboardData.leadsByStatus.won || 0 },
    { Metric: "Dead", Value: dashboardData.leadsByStatus.dead || 0 },
  ];

  const csv = arrayToCSV(summaryData);
  const filename = `dashboard-summary-${new Date().toISOString().split("T")[0]}.csv`;

  downloadCSV(csv, filename);
}
