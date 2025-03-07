import { useFileStore } from "@/store/file-store";
import { FC } from "react";
import { useAppStore } from "@/store/app-store";

export const ResultContainer: FC = () => {
  const { files } = useFileStore();
  const { primaryColor } = useAppStore().getPrimaryColor;

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex">
        <div className="w-[210px] h-[210px] border border-gray-300 rounded-md flex items-center justify-center">
          <img
            src={files[0].url}
            alt={files[0].name}
            className="w-[200px] h-[200px] object-contain"
          />
        </div>
        <div className="flex flex-col ml-4">
          <div className="text-sm font-medium">Primary Color</div>
          <div className="text-sm">
            <div
              className="w-10 h-10 rounded-sm"
              style={{ backgroundColor: primaryColor?.hex }}
            ></div>
            <div className="text-sm">
              <div>
                <span className="font-bold">Hex:</span> {primaryColor?.hex}
              </div>
              <div>
                <span className="font-bold">RGB:</span>
                {primaryColor
                  ? `rgb(${primaryColor?.rgb.r}, ${primaryColor?.rgb.g}, ${primaryColor?.rgb.b})`
                  : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
