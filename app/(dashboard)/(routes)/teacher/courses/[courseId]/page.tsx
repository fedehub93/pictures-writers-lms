import { IconBadge } from "@/components/icon-badge";
import { auth } from "@clerk/nextjs";
import { CircleDollarSign, LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";
import TitleForm from "./_components/title-form";
import DescriptionForm from "./_components/description-form";
import ImageForm from "./_components/image-form";
import CategoryForm from "./_components/category-form";
import PriceForm from "./_components/price-form";

export const getData = async (id: string) => {
  const courseResponse = await fetch(
    `http://127.0.0.1:1337/api/courses/${id}?populate=*`,
    {
      headers: { Authorization: `Bearer ${process.env.STRAPI_CONTENT_TOKEN}` },
    }
  );
  const courseJson = await courseResponse.json();

  const categoriesResponse = await fetch(
    `http://127.0.0.1:1337/api/course-categories`,
    {
      headers: { Authorization: `Bearer ${process.env.STRAPI_CONTENT_TOKEN}` },
    }
  );
  const categoriesJson = await categoriesResponse.json();
  return {
    course: {
      id: courseJson.data.id,
      ...courseJson.data.attributes,
    },
    categories: { ...categoriesJson },
  };
};

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) return redirect("/");

  const { course, categories } = await getData(params.courseId);

  if (!course) return redirect("/");
  const requiredFields = [
    course.title,
    course.description,
    course.price,
    course.course_category,
  ];

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
          <TitleForm initialData={course} courseId={course.id} />
          <DescriptionForm initialData={course} courseId={course.id} />
          <ImageForm initialData={course} courseId={course.id} />
          <CategoryForm
            initialData={course}
            courseId={course.id}
            options={categories.data.map(
              (category: { id: number; attributes: { name: string } }) => ({
                label: category.attributes.name,
                value: category.id,
              })
            )}
          />
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="Course chapters">Course chapters</h2>
            </div>
            <div>TODO: Chapters</div>
          </div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={CircleDollarSign} />
            <h2>Sell your course</h2>
          </div>
          <PriceForm initialData={course} courseId={course.id} />
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;
