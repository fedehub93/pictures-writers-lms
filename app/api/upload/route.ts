import { auth } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";
import FormData from "form-data";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const formData = await req.formData();
    console.log("[FORMDATA]", formData);
    if (!req.formData) {
      return NextResponse.json("Wrong file", { status: 404 });
    }

    const file = formData.getAll("files")[0] as Blob | null;

    if (!file) {
      return NextResponse.json("Wrong file", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const form = new FormData();
    form.append("files", buffer, {
      filename: "esempio",
      contentType: file.type,
    });

    const headers = {
      "Content-Type": file.type,
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    };

    const response = await axios.post(
      "http://127.0.0.1:1337/api/upload",
      form,
      {
        headers,
      }
    );

    return NextResponse.json({ ...response.data });
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
