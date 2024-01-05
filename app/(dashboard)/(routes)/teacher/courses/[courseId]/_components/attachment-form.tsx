"use client";

import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  File,
  Loader2,
  PlusCircle,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { LoadingSpinner } from "@/components/loading-spinner";
import { APIResponse } from "@/types/types";

interface AttachmentFormProps {
  initialData: APIResponse<"api::course.course">;
  courseId: number;
}

const AttachmentForm = ({ initialData, courseId }: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();
  const onDrop = useCallback(async (acceptedFiles: any[]) => {
    // Do something with the files
    const formData = new FormData();

    if (!acceptedFiles || acceptedFiles.length === 0) {
      return;
    }

    formData.append("files", acceptedFiles[0]);

    try {
      setIsLoading(true);
      // const response = await axios.post(`/api/upload`, formData);

      await axios.post(`/api/courses/${courseId}/attachments`, formData);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const onDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success("Attachment deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a file
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.data.attributes.course_attachments?.data &&
            initialData.data.attributes.course_attachments?.data.length === 0 && (
              <p className="text-sm mt-2 text-slate-500 italic">
                No attachments yet
              </p>
            )}
          {initialData.data.attributes.course_attachments?.data &&
            initialData.data.attributes.course_attachments?.data.length > 0 && (
              <div className="space-y-2">
                {initialData.data.attributes.course_attachments?.data.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                  >
                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p className="text-xs line-clamp-1">
                      {attachment.attributes.name}
                    </p>
                    {deletingId === attachment.id && (
                      <div>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {deletingId !== attachment.id && (
                      <button
                        onClick={() => onDelete(attachment.id)}
                        className="ml-auto hover:opacity-75 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
        </>
      )}
      {isEditing && !isLoading && (
        <form className="space-y-4 mt-4">
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <div className="flex flex-col gap-y-2 cursor-pointer items-center justify-center h-60 bg-slate-200 rounded-md">
                <UploadCloud className="h-10 w-10 text-slate-500" />
                <p>
                  Add anything your students might need to complete the course.
                </p>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-4">
              16:9 aspect ratio recommended
            </div>
          </div>
        </form>
      )}
      {isEditing && isLoading && <LoadingSpinner className="h-10 w-10" />}
    </div>
  );
};

export default AttachmentForm;
