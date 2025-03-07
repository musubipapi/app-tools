import { DropZone } from "../common/drop-zone";
import { ListTable } from "./list-table";
import { cn } from "@/lib/utils";

type Props = {};

const Png2Webp = (props: Props) => {
  return (
    <>
      <div className={cn("p-4 w-full h-full")}>
        <DropZone
          multiple
          content={
            <div className="text-center font-semibold mt-2">
              Drag & drop or{" "}
              <span className="group-hover:text-blue-500 transition-all duration-300 ease-in-out">
                choose an image
              </span>{" "}
              to convert
            </div>
          }
        />
        <div className="mt-4">
          <ListTable />
        </div>
      </div>
    </>
  );
};

export default Png2Webp;
