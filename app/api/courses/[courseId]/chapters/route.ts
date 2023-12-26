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
    const courseJson = await courseResponse.json();
    const courseOwner = userId === courseJson.data.attributes.user_id;

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lastChapterResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}/last-chapter`,
      { headers }
    );
    const lastChapter = await lastChapterResponse.json();
    const newPosition = lastChapter.data
      ? lastChapter.data.attributes.position + 1
      : 1;

    const chapter = await axios.post(
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
    );

    return NextResponse.json({ ...chapter.data });
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
