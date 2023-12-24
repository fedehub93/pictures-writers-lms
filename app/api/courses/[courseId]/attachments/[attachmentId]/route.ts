import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: number } }
) {
  try {
    const { userId } = auth();
    const { courseId, attachmentId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    };

    const courseResponse = await fetch(
      `${process.env.STRAPI_URL}/api/courses/${courseId}?`,
      { headers }
    );

    const courseJson = await courseResponse.json();
    const courseOwner = userId === courseJson.data.attributes.user_id;

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseAttachment = await axios.delete(
      `${process.env.STRAPI_URL}/api/course-attachments/${attachmentId}`,
      { headers }
    );

    return new NextResponse({ ...courseAttachment.data });
  } catch (error) {
    console.log("ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
