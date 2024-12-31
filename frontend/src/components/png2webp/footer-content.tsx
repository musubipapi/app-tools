import { useEffect, useState } from "react";
import { BatchConvertToWebP } from "../../../wailsjs/go/app/App";
import { EventsOn } from "../../../wailsjs/runtime";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import { useFileStore } from "@/store/file-store";
import { ConversionStatus } from "@/lib/types";

export const FooterContent = () => {
  const { targetFolder } = useAppStore().png2webp;
  const { files, updateFileConversionStatus } = useFileStore();

  const isConvertable = files.length > 0 && targetFolder !== "";
  const [isConverting, setIsConverting] = useState(false);
  useEffect(() => {
    // Subscribe to conversion status events
    const unsubStatus = EventsOn("conversion_status", (status) => {
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
      setIsConverting(true);
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
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="p-2">
      <div className="text-xs italic text-muted-foreground mb-5">
        Currently, we only support maximum compression lossless WebP conversion.
        More settings will be added soon.
      </div>
      <div>
        <Button
          disabled={!isConvertable || isConverting}
          onClick={handleConvert}
          className="w-full"
        >
          {isConverting ? "Converting..." : "Convert"}
        </Button>
      </div>
    </div>
  );
};
