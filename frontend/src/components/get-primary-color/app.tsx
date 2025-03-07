import { ResultContainer } from "./result-container";
import { cn } from "@/lib/utils";
import { DropZone } from "../common/drop-zone";

type Props = {};

const GetPrimaryColor = (props: Props) => {
  return (
    <>
      <div className={cn("p-4 w-full h-full")}>
        <DropZone
          content={
            <div className="text-center font-semibold mt-2">
              Drag & drop or choose an image
            </div>
          }
        />
        <ResultContainer />
      </div>
    </>
  );
};

export default GetPrimaryColor;
