import { FooterContent as Png2WebpFooterContent } from "@/components/png2webp/footer-content";
import { FooterContent as GetPrimaryColorFooterContent } from "@/components/get-primary-color/footer-content";
import { SidebarFooter } from "@/components/ui/sidebar";
import { APPS } from "@/lib/consts";
import { useAppStore } from "@/store/app-store";

type Props = {};

export const FooterContainer = (props: Props) => {
  const { selectedApp } = useAppStore();
  return (
    <SidebarFooter className="p-0">
      {selectedApp === APPS.PNG2WEBP && <Png2WebpFooterContent />}
      {selectedApp === APPS.GET_PRIMARY_COLOR && (
        <GetPrimaryColorFooterContent />
      )}
    </SidebarFooter>
  );
};
