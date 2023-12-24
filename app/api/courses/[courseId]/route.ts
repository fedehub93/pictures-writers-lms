import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    };

    const course = await axios.put(
      `${process.env.STRAPI_URL}/api/courses/${courseId}`,
      { data: { ...values } },
      { headers }
    );

    return NextResponse.json({ id: course.data.id, ...course.data.attributes });
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
