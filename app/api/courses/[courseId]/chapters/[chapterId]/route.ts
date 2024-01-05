import Mux from "@mux/mux-node";
import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";
import { APIResponse, APIResponseCollection } from "@/types/types";

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function DELETE(
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
    const chapter =
      (await chapterResponse.json()) as APIResponse<"api::course-chapter.course-chapter">;

    if (!chapter.data) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (chapter.data?.attributes.video?.data?.attributes) {
      const existingMuxData = chapter.data.attributes.mux_data;
      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.data.attributes.asset_id);
        await axios.delete(
          `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters/${chapterId}/mux-data`,
          { headers }
        );
      }
    }

    const deletedChapter = (await axios.delete(
      `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters/${chapterId}`,
      { headers }
    )) as { data: APIResponse<"api::course-chapter.course-chapter"> };

    const publishedChaptersInCourse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters?publicationState=live`,
      { headers }
    );

    const chapters =
      (await publishedChaptersInCourse.json()) as APIResponseCollection<"api::course-chapter.course-chapter">;

    if (!chapters.data.length) {
      await axios.put(
        `${process.env.STRAPI_URL}/api/courses/${courseId}`,
        { data: { publishedAt: null } },
        { headers }
      );
    }

    return NextResponse.json({
      ...deletedChapter.data,
    });
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId, chapterId } = params;
    const { isPublished, ...values } = await req.json();
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
      `${process.env.STRAPI_URL}/api/course-chapters/${chapterId}?populate=video`,
      { data: { ...values } },
      { headers }
    );

    // if (chapter.data?.data?.attributes.video?.data.attributes.url) {
    //   const existingMuxData = chapter.data.data.attributes.mux_data;
    //   if (existingMuxData) {
    //     await Video.Assets.del(existingMuxData.asset_id);
    //     await axios.delete(
    //       `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters/${chapterId}/mux-data`,
    //       { headers }
    //     );
    //   }

    //   const asset = await Video.Assets.create({
    //     input: chapter.data.data.attributes.video.data.attributes.url,
    //     playback_policy: "public",
    //     test: false,
    //   });

    //   await axios.post(
    //     `${process.env.STRAPI_URL}/api/mux-datas`,
    //     {
    //       data: {
    //         chapter_id: chapterId,
    //         asset_id: asset.id,
    //         playback_id: asset.playback_ids?.[0]?.id,
    //       },
    //     },
    //     { headers }
    //   );
    // }

    return NextResponse.json({
      id: chapter.data.id,
      ...chapter.data.attributes,
    });
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
