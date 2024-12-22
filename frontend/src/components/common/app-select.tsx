import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPS } from "@/lib/consts";
import { useAppStore } from "@/store/app-store";

export const AppSelect = () => {
  const { selectedApp, setSelectedApp } = useAppStore();

  return (
    <Select value={selectedApp} onValueChange={setSelectedApp}>
      <SelectTrigger className="w-[180px]">
        <SelectValue defaultValue={selectedApp} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={APPS.PNG2WEBP}>png2webp</SelectItem>
      </SelectContent>
    </Select>
  );
};
