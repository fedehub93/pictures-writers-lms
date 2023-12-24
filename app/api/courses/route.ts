import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    };

    const response = await axios.post(
      `${process.env.STRAPI_URL}/api/courses`,
      { data: { title, user_id: userId } },
      { headers }
    );

    return NextResponse.json({ ...response.data.data });
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
