"use client";

import axios from "axios";
import toast from "react-hot-toast";
import MuxPlayer from "@mux/mux-player-react";

import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, UploadCloud, VideoIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { LoadingSpinner } from "@/components/loading-spinner";
import { APIResponse } from "@/types/types";

interface ChapterVideoFormProps {
  initialData: APIResponse<"api::course-chapter.course-chapter">;
  courseId: number | string;
  chapterId: number | string;
}

const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await axios.post(`/api/upload`, formData);
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        video: response.data[0].id,
      });
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.data.attributes.video && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}
          {!isEditing && initialData.data.attributes.video && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.data.attributes.video ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <VideoIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <MuxPlayer
              playbackId={
                initialData?.data?.attributes.mux_data?.data.attributes
                  .playback_id || ""
              }
            />
          </div>
        ))}
      {isEditing && !isLoading && (
        <form className="space-y-4 mt-4">
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <div className="flex flex-col gap-y-2 cursor-pointer items-center justify-center h-60 bg-slate-200 rounded-md">
                <UploadCloud className="h-10 w-10 text-slate-500" />
                <p>Choose file...</p>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-4">
              Upload this chapter&apos;s video
            </div>
          </div>
        </form>
      )}
      {initialData.data.attributes.video && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if video
          does not appear
        </div>
      )}
      {isEditing && isLoading && <LoadingSpinner className="h-10 w-10" />}
    </div>
  );
};

export default ChapterVideoForm;
