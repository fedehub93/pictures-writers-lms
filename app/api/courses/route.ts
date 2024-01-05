import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.create({
      data: {
        userId,
        title,
      },
    });

    // const headers = {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    // };

    // const response = (await axios.post(
    //   `${process.env.STRAPI_URL}/api/courses`,
    //   { data: { title, user_id: userId } },
    //   { headers }
    // )) as { data: APIResponse<"api::course.course"> };

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
