import { useEffect, useState } from "react";
import {
  BatchConvertToWebP,
  ConvertToWebP,
  InstallWebP,
} from "../../../wailsjs/go/app/App";
import { EventsOn } from "../../../wailsjs/runtime";
import { Button } from "../ui/button";
import { AlertTriangleIcon } from "lucide-react";
import { checkError } from "@/lib/utils";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import { useFileStore } from "@/store/file-store";
import { ConversionStatus } from "@/lib/types";

export const FooterContent = () => {
  const [isInstalling, setIsInstalling] = useState(false);
  const { isWebPInstalled, checkWebPInstallation, targetFolder } =
    useAppStore().png2webp;
  const { files, updateFileConversionStatus } = useFileStore();

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

  const isConvertable = files.length > 0 && targetFolder !== "";

  useEffect(() => {
    // Subscribe to conversion status events
    const unsubStatus = EventsOn("conversion_status", (status) => {
      console.log("yoyo", status);
      switch (status.status) {
        case "converting":
          updateFileConversionStatus(status.id, ConversionStatus.Converting);
          break;

        case "completed":
          updateFileConversionStatus(status.id, ConversionStatus.Completed);
          break;

        case "failed":
          updateFileConversionStatus(status.id, ConversionStatus.Failed);
          break;
      }
    });

    const unsubComplete = EventsOn("conversion_complete", () => {
      toast.success("All conversions completed!");
    });

    return () => {
      unsubStatus();
      unsubComplete();
    };
  }, []);

  const handleConvert = async () => {
    try {
      await BatchConvertToWebP(
        files.map((file) => ({
          Data: file.data,
          ID: file.id,
          Filename: file.name,
        })),
        targetFolder
      );
    } catch (error) {
      console.error("Conversion process failed:", error);
      toast.error("Conversion process failed");
    }
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
      <div className="text-xs italic text-muted-foreground mb-5">
        Currently, we only support maximum compression lossless WebP conversion.
        More settings will be added soon.
      </div>
      <div>
        <Button
          disabled={!isConvertable}
          onClick={handleConvert}
          className="w-full"
        >
          Convert
        </Button>
      </div>
    </div>
  );
};
