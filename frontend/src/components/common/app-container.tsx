import { APPS } from "@/lib/consts";
import { useAppStore } from "@/store/app-store";
import React from "react";
import Png2Webp from "../png2webp/app";

export const AppContainer = () => {
  const { selectedApp } = useAppStore();
  return (
    <div className="w-full h-full">
      {selectedApp === APPS.PNG2WEBP && <Png2Webp />}
    </div>
  );
};
