import { Folder } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

import { SelectFolder } from "../../../wailsjs/go/app/App";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export const Content = () => {
  const { targetFolder, setTargetFolder } = useAppStore().png2webp;

  const selectFolder = async () => {
    const folder = await SelectFolder();
    setTargetFolder(folder);
  };
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="p-0">Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="text-xs select-none">Target Folder</div>
          <div
            className="relative flex items-center w-full mt-1"
            onClick={selectFolder}
          >
            <div
              className={cn(
                "select-none w-full border border-black rounded-md p-2 text-black disabled:text-black placeholder:text-black",
                targetFolder ? "text-black" : "text-gray-500"
              )}
              aria-label="Target folder path"
            >
              {targetFolder || "Select a folder"}
            </div>
            <div
              aria-label="Select folder"
              className="absolute right-0 bottom-0 top-0 mr-2 flex items-center cursor-pointer"
            >
              <Folder className="h-4 w-4 hover:fill-yellow-500" />
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};
