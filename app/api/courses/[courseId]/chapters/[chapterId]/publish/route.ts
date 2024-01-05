import { APIResponse } from "@/types/types";
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
    const course =
      (await courseResponse.json()) as APIResponse<"api::course.course">;
    const courseOwner = userId === course.data.attributes.user_id;

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapterResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters/${chapterId}`,
      { headers }
    );
    const chapterJson =
      (await chapterResponse.json()) as APIResponse<"api::course-chapter.course-chapter">;

    if (
      !chapterJson.data ||
      // !chapterJson.data.attributes.mux_data?.data ||
      // !chapterJson.data.attributes.video?.data ||
      !chapterJson.data.attributes.title ||
      !chapterJson.data.attributes.description
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const chapter = (await axios.put(
      `${process.env.STRAPI_URL}/api/course-chapters/${chapterId}`,
      { data: { publishedAt: new Date() } },
      { headers }
    )) as { data: APIResponse<"api::course-chapter.course-chapter"> };

    return NextResponse.json({ ...chapter.data });
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
