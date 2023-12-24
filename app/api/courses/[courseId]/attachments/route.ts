import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";
import FormData from "form-data";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}?`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
      }
    );
    const courseJson = await courseResponse.json();
    const courseOwner = userId === courseJson.data.attributes.user_id;

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    if (!req.formData) {
      return NextResponse.json("Wrong file", { status: 404 });
    }

    const file = formData.getAll("files")[0] as File | null;

    if (!file) {
      return NextResponse.json("Wrong file", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const form = new FormData();
    form.append("files", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    const headers = {
      "Content-Type": file.type,
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    };

    const response = await axios.post(
      `${process.env.STRAPI_URL}/api/upload`,
      form,
      { headers }
    );

    const headersTwo = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    };

    const course_attachment = await axios.post(
      `${process.env.STRAPI_URL}/api/course-attachments`,
      {
        data: {
          name: response.data[0].name,
          file: response.data[0].id,
          course: courseId,
        },
      },
      {
        headers: headersTwo,
      }
    );
    return NextResponse.json({ ...course_attachment.data });
  } catch (error) {
    console.log("COURSE_ID_ATTACHMENTS", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
