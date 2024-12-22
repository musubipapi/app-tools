import { useEffect, useState } from "react";
import { CheckWebP, InstallWebP } from "../../../wailsjs/go/main/App";
import { Button } from "../ui/button";
import { AlertTriangleIcon } from "lucide-react";
import { checkError } from "@/lib/utils";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";

export const FooterContent = () => {
  const [isInstalling, setIsInstalling] = useState(false);
  const { isWebPInstalled, checkWebPInstallation } = useAppStore().png2webp;
  useEffect(() => {
    checkWebPInstallation();
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const [error, response] = await checkError(InstallWebP());
    if (error) {
      toast.error(error.message);
    }
    if (response) {
      toast.success("WebP installed successfully", {
        position: "bottom-center",
      });
      checkWebPInstallation();
    }
    setIsInstalling(false);
  };
  if (!isWebPInstalled) {
    return (
      <div className="bg-yellow-100 p-2">
        <div className=" text-yellow-600 flex items-center gap-2">
          <AlertTriangleIcon className="w-10 h-10" />
          <div className="text-xs">
            This tool requires WebP to be installed on your system.
          </div>
        </div>
        <div className="mt-2">
          <Button
            size="sm"
            disabled={isInstalling}
            onClick={handleInstall}
            className="w-full bg-yellow-800 hover:bg-yellow-900"
          >
            {isInstalling ? "Installing..." : "Install now"}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-2">
      <Button className="w-full">Convert</Button>
    </div>
  );
};
