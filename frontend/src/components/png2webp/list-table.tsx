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
import { FC } from "react";
import { Checkbox } from "../ui/checkbox";
import { Trash2Icon } from "lucide-react";

interface ListTableProps {
  files: FileInfo[];
}

export const ListTable: FC<ListTableProps> = ({ files }) => {
  const { removeFile } = useFileStore();
  return (
    <Table>
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
              <div className="w-6 h-6 select-none">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-6 h-6 object-contain select-none"
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
                className="text-xs text-muted-foreground whitespace-nowrap hover:text-red-400 cursor-pointer"
              >
                <Trash2Icon className="w-4 h-4" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
