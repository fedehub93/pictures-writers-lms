import { APIResponse } from "@/types/types";
import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;

    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const headers = { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` };

    const courseResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}`,
      { headers }
    );
    const course =
      (await courseResponse.json()) as APIResponse<"api::course.course">;
    const courseOwner = userId === course.data.attributes.user_id;

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lastChapterResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}/last-chapter`,
      { headers }
    );
    const lastChapter =
      (await lastChapterResponse.json()) as APIResponse<"api::course-chapter.course-chapter">;
    const newPosition = lastChapter.data?.attributes.position
      ? lastChapter.data.attributes.position + 1
      : 1;

    const chapter = (await axios.post(
      `${process.env.STRAPI_URL}/api/course-chapters`,
      {
        data: {
          title,
          course: courseId,
          position: newPosition,
          publishedAt: null,
        },
      },
      { headers }
    )) as { data: APIResponse<"api::course-chapter.course-chapter"> };

    return NextResponse.json({ ...chapter.data });
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
