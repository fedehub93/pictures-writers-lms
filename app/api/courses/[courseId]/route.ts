import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    };

    const courseResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}?populate[course_chapters][populate]=mux_data`,
      { headers }
    );
    const course = await courseResponse.json();
    if (!course.data) {
      return new NextResponse("Not found", { status: 400 });
    }
    
    const courseOwner = userId === course.data.attributes.user_id;
    console.log(courseOwner)

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    for (const chapter of course.data?.attributes?.course_chapters?.data) {
      if (chapter.attributes.mux_data?.data?.attributes.asset_id) {
        // await Video.Assets.del(
        //   chapter.attributes.mux_data?.data?.attributes.asset_id
        // );
      }
    }
    console.log(deletedCourse);

    const deletedCourseResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}`,
      { headers, method: "DELETE" }
    );

    const deletedCourse = deletedCourseResponse.json();
    console.log(deletedCourse);

    return NextResponse.json({ ...deletedCourse });
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
