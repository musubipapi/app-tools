import { FC, useCallback } from "react";
import { useDropzone } from "react-dropzone/.";
import { UploadIcon } from "lucide-react";
import { useFileStore } from "../../store/file-store";

interface DropZoneProps {}

export const DropZone: FC<DropZoneProps> = ({}) => {
  const { addFile } = useFileStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        await addFile(file);
      }
    },
    [addFile]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-gray-300 cursor-pointer group border-dashed rounded-md w-full p-4 flex flex-col items-center justify-center"
    >
      <input {...getInputProps()} />
      <div>
        <UploadIcon className="w-10 h-10 text-gray-500 group-hover:text-blue-500 transition-all duration-300 ease-in-out" />
      </div>
      <div className="text-center font-semibold mt-2">
        Drag & drop or{" "}
        <span className="group-hover:text-blue-500 transition-all duration-300 ease-in-out">
          choose an image
        </span>{" "}
        to convert
      </div>
    </div>
  );
};
