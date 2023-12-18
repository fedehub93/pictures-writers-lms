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

    const data = {
      data: {
        title,
      },
    };

    const result = await fetch("http://127.0.0.1:1337/api/courses", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const json = (await result.json()) as { error: string | null; data: any };
    return NextResponse.json({...json.data});
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
