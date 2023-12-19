import { IconBadge } from "@/components/icon-badge";
import { auth } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import TitleForm from "./_components/title-form";

export const getCourse = async (id: string) => {
  const response = await fetch(`http://127.0.0.1:1337/api/courses/${id}`, {
    headers: { Authorization: `Bearer ${process.env.STRAPI_CONTENT_TOKEN}` },
  });
  const json = await response.json();
  return { id: json.data.id, ...json.data.attributes };
};

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) return redirect("/");

  const course = await getCourse(params.courseId);

  if (!course) return redirect("/");

  const requiredFields = [course.title, course.description, course.price];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-slate-700">
            Complete all fields {completionText}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h2 className="text-xl">Customize your course</h2>
          </div>
        </div>
        <TitleForm initialData={course} courseId={course.id} />
      </div>
    </div>
  );
};

export default CourseIdPage;