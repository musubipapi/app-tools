import { DropZone } from "./drop-zone";
import { ListTable } from "./list-table";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

type Props = {};

const Png2Webp = (props: Props) => {
  return (
    <>
      <div className={cn("p-4 w-full h-full")}>
        <DropZone />
        <div className="mt-4">
          <ListTable />
        </div>
      </div>
    </>
  );
};

export default Png2Webp;
