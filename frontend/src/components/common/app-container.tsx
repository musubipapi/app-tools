import { APPS } from "@/lib/consts";
import { useAppStore } from "@/store/app-store";
import Png2Webp from "../png2webp/app";
import GetPrimaryColor from "../get-primary-color/app";
export const AppContainer = () => {
  const { selectedApp } = useAppStore();
  return (
    <div className="w-full h-full">
      {selectedApp === APPS.PNG2WEBP && <Png2Webp />}
      {selectedApp === APPS.GET_PRIMARY_COLOR && <GetPrimaryColor />}
    </div>
  );
};
