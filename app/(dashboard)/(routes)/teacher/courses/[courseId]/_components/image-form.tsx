"use client";

import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Pencil,
  PlusCircle,
  UploadCloud,
  UploadIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { LoadingSpinner } from "@/components/loading-spinner";

interface ImageFormProps {
  initialData: {
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
  courseId: string;
}

const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
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
      await axios.patch(`/api/courses/${courseId}`, {
        image: response.data[0].id,
      });
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

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course image
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.image && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an image
            </>
          )}
          {!isEditing && initialData.image && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit image
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.image.data ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              alt="upload"
              fill
              className="object-cover rounded-md"
              src={initialData.image.data.attributes.url}
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
              16:9 aspect ratio recommended
            </div>
          </div>
        </form>
      )}
      {isEditing && isLoading && <LoadingSpinner className="h-10 w-10" />}
    </div>
  );
};

export default ImageForm;
