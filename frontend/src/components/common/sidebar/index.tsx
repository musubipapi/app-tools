import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { AppSelect } from "../app-select";
import { FooterContainer } from "./footer-container";
import { ContentContainer } from "./content-container";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="text-xl font-bold">Tools</div>
        <AppSelect />
      </SidebarHeader>
      <ContentContainer />
      <FooterContainer />
    </Sidebar>
  );
}
