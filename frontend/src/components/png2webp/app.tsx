import { DropZone } from "./drop-zone";
import { useFileStore } from "@/store/file-store";
import { ListTable } from "./list-table";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

type Props = {};

const Png2Webp = (props: Props) => {
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
          <ListTable />
        </div>
      </div>
    </>
  );
};

export default Png2Webp;
