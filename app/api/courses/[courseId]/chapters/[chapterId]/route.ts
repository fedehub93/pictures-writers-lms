import Mux from "@mux/mux-node";
import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";

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
    const courseJson = await courseResponse.json();
    const courseOwner = userId === courseJson.data.attributes.user_id;

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapterResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters/${chapterId}`,
      { headers }
    );
    const chapterJson = await chapterResponse.json();

    if (!chapterJson.data) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (chapterJson.data?.attributes.video?.data?.attributes) {
      const existingMuxData = chapterJson.data.attributes.mux_data;
      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.asset_id);
        await axios.delete(
          `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters/${chapterId}/mux-data`,
          { headers }
        );
      }
    }

    const deletedChapter = await axios.delete(
      `${process.env.STRAPI_URL}/api/courses/${courseId}/chapters/${chapterId}`,
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
