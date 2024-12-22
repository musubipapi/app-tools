import React from "react";
import { DropZone } from "./drop-zone";
import { useFileStore } from "@/store/file-store";
import { ListTable } from "./list-table";
import { Button } from "../ui/button";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

type Props = {};

const Png2Webp = (props: Props) => {
  const { files } = useFileStore();
  const { isWebPInstalled } = useAppStore().png2webp;
  return (
    <>
      {!isWebPInstalled && (
        <div className="fixed w-full h-full top-0 z-10 bg-black opacity-20" />
      )}
      <div
        className={cn("p-4 w-full h-full", !isWebPInstalled && "select-none")}
      >
        <DropZone />
        <div className="mt-4">
          {/* {files.map((file) => (
          <div className="py-1" key={file.id}>
            <img src={file.url} alt={file.name} className="w-4 h-4" />
          </div>
        ))} */}
          <ListTable files={files} />
        </div>
      </div>
    </>
  );
};

export default Png2Webp;
