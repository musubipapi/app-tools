import { Content } from "@/components/png2webp/sidebar-content";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { APPS } from "@/lib/consts";
import { useAppStore } from "@/store/app-store";

export const ContentContainer = () => {
  const { selectedApp } = useAppStore();
  return <>{selectedApp === APPS.PNG2WEBP && <Content />}</>;
};
