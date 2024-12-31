import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFileSize } from "@/lib/formatter";
import { FileInfo, useFileStore } from "@/store/file-store";
import { FC, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { CheckIcon, Loader2Icon, Trash2Icon, XIcon } from "lucide-react";
import { ConversionStatus } from "@/lib/types";

interface ListTableProps {}

const actionComponent = (status: ConversionStatus) => {
  switch (status) {
    case ConversionStatus.Pending:
      return <Trash2Icon className="w-4 h-4" />;
    case ConversionStatus.Converting:
      return <Loader2Icon className="w-4 h-4 animate-spin text-yellow-500" />;
    case ConversionStatus.Completed:
      return <CheckIcon className="w-4 h-4 text-green-500" />;
    case ConversionStatus.Failed:
      return <XIcon className="w-4 h-4 text-red-500" />;
  }
};

export const ListTable: FC<ListTableProps> = () => {
  const { removeFile, files } = useFileStore();
  const [isHovered, setIsHovered] = useState<string | null>(null);
  if (files.length === 0) {
    return null;
  }

  return (
    <Table className="select-none">
      <TableHeader>
        <TableRow>
          <TableHead className="w-6" />
          <TableHead className="w-full">Name</TableHead>
          <TableHead className="w-full">Size</TableHead>
          <TableHead className="w-6" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell className="p-2">
              <div className="w-6 h-6">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-6 h-6 object-contain"
                />
              </div>
            </TableCell>
            <TableCell className="flex">
              <div className="w-full">{file.name}</div>
            </TableCell>
            <TableCell>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatFileSize(file.size)}
              </div>
            </TableCell>
            <TableCell>
              <div
                onClick={() => removeFile(file.id)}
                onMouseOver={() => setIsHovered(file.id)}
                onMouseOut={() => setIsHovered(null)}
                className="text-xs text-muted-foreground whitespace-nowrap cursor-pointer"
              >
                {isHovered === file.id &&
                file.conversionStatus !== ConversionStatus.Converting ? (
                  <Trash2Icon className="w-4 h-4 text-red-500" />
                ) : (
                  actionComponent(file.conversionStatus)
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
