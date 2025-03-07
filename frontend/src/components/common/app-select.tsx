import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPS } from "@/lib/consts";
import { useAppStore } from "@/store/app-store";
import { useFileStore } from "@/store/file-store";

export const AppSelect = () => {
  const { selectedApp, setSelectedApp } = useAppStore();
  const { clearFiles } = useFileStore();

  useEffect(() => {
    clearFiles();
  }, [selectedApp]);

  return (
    <Select value={selectedApp} onValueChange={setSelectedApp}>
      <SelectTrigger className="w-[180px]">
        <SelectValue defaultValue={selectedApp} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={APPS.PNG2WEBP}>png2webp</SelectItem>
        <SelectItem value={APPS.GET_PRIMARY_COLOR}>
          Get Primary Color
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
