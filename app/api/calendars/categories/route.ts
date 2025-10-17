import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const categories = [
  {
    label: "Business",
    value: "business",
    className: "data-[state=checked]:bg-primary border-primary",
  },
  {
    label: "Personal",
    value: "personal",
    className: "data-[state=checked]:bg-success border-success",
  },
  {
    label: "Holiday",
    value: "holiday",
    className: "data-[state=checked]:bg-destructive border-destructive",
  },
  {
    label: "Family",
    value: "family",
    className: "data-[state=checked]:bg-info border-info",
  },
  {
    label: "Meeting",
    value: "meeting",
    className: "data-[state=checked]:bg-warning border-warning",
  },
  {
    label: "Etc",
    value: "etc",
    className: "data-[state=checked]:bg-info border-info",
  },
];

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "success",
    message: "Categories fetched successfully",
    data: categories,
  });
}
