import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId, chapterId } = params;

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

    const chapter = await axios.put(
      `${process.env.STRAPI_URL}/api/course-chapters/${chapterId}`,
      { data: { publishedAt: null } },
      { headers }
    );

    const publishedChaptersInCourse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters?publicationState=live`,
      { headers }
    );

    const chaptersJson = await publishedChaptersInCourse.json();

    if (!chaptersJson.data.length) {
      await axios.put(
        `${process.env.STRAPI_URL}/api/courses/${courseId}`,
        { data: { publishedAt: null } },
        { headers }
      );
    }

    return NextResponse.json({ ...chapter.data });
  } catch (error) {
    console.log("[CHAPTER_UNPUBLISH]");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
