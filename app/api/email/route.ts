import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
// Mock data removed - ready for real email integration

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    // TODO: Query real emails from database when email system is implemented
    return NextResponse.json({
      status: "success",
      message: "Email inbox (empty - awaiting integration)",
      data: [], // Empty array instead of mock data
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    });
  }
}

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    let reqBody = await request.json();
    reqBody.id = mails.length + 1;
    mails.unshift(reqBody);

    return NextResponse.json({
      status: "success",
      message: "Email Send successfully",
      data: reqBody,
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    });
  }
}
