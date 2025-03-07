import { FC, useCallback } from "react";
import { useDropzone } from "react-dropzone/.";
import { UploadIcon } from "lucide-react";
import { useFileStore } from "../../store/file-store";

interface DropZoneProps {
  multiple?: boolean;
  content?: React.ReactNode;
}

export const DropZone: FC<DropZoneProps> = ({ content, multiple = false }) => {
  const { addFile, clearFiles } = useFileStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (multiple) {
        for (const file of acceptedFiles) {
          await addFile(file);
        }
      } else {
        clearFiles();
        await addFile(acceptedFiles[0]);
      }
    },
    [addFile]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png"],
    },
    maxFiles: multiple ? undefined : 1,
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
      {content}
    </div>
  );
};
