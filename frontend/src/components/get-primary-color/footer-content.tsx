import { useState } from "react";
import { Button } from "../ui/button";
import { useAppStore } from "@/store/app-store";
import { useFileStore } from "@/store/file-store";
import getDominantColor from "./script";

export const FooterContent = () => {
  const { files } = useFileStore();
  const { setPrimaryColor, neurons, epochs } = useAppStore().getPrimaryColor;

  const isConvertable = files.length > 0;
  const [isConverting, setIsConverting] = useState(false);

  const handleGetPrimaryColor = async () => {
    setIsConverting(true);
    const result = await getDominantColor(files[0].url, neurons, epochs);
    setPrimaryColor(result.rgb, result.hex);
    setIsConverting(false);
  };

  return (
    <div className="p-2">
      <div className="text-xs italic text-muted-foreground mb-5">
        Uses MNCQ algorithm to get the dominant color
      </div>
      <div>
        <Button
          disabled={!isConvertable || isConverting}
          onClick={handleGetPrimaryColor}
          className="w-full"
        >
          {isConverting ? "Calculating..." : "Get Color"}
        </Button>
      </div>
    </div>
  );
};
