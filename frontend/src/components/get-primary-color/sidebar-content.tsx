import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Input } from "../ui/input";
import { useAppStore } from "@/store/app-store";

export const Content = () => {
  const { neurons, epochs, setEpochs, setNeurons } =
    useAppStore().getPrimaryColor;

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="p-0">Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-2">
            <div>
              <div className="font-semibold text-xs">Neurons</div>
              <Input
                type="number"
                min={1}
                max={100}
                step={1}
                placeholder="Neurons"
                defaultValue={neurons}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = Math.max(
                    1,
                    Math.min(100, Number(e.target.value))
                  );
                  setNeurons(value);
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-xs">Epochs</div>
              <Input
                type="number"
                min={1}
                max={100}
                step={1}
                placeholder="Epochs"
                defaultValue={epochs}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = Math.max(
                    1,
                    Math.min(100, Number(e.target.value))
                  );
                  setEpochs(value);
                }}
              />
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};
