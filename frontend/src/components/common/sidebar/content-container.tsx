import { Content as Png2WebpContent } from "@/components/png2webp/sidebar-content";
import { Content as GetPrimaryColorContent } from "@/components/get-primary-color/sidebar-content";

import { APPS } from "@/lib/consts";
import { useAppStore } from "@/store/app-store";

export const ContentContainer = () => {
  const { selectedApp } = useAppStore();
  return (
    <>
      {selectedApp === APPS.PNG2WEBP && <Png2WebpContent />}
      {selectedApp === APPS.GET_PRIMARY_COLOR && <GetPrimaryColorContent />}
    </>
  );
};
