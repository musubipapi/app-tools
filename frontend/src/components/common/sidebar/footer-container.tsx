import { FooterContent } from "@/components/png2webp/footer-content";
import { SidebarFooter } from "@/components/ui/sidebar";
import { APPS } from "@/lib/consts";
import { useAppStore } from "@/store/app-store";

type Props = {};

export const FooterContainer = (props: Props) => {
  const { selectedApp } = useAppStore();
  return (
    <SidebarFooter className="p-0">
      {selectedApp === APPS.PNG2WEBP && <FooterContent />}
    </SidebarFooter>
  );
};
