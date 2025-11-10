import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type ExportFormat = "csv" | "pdf";

export function ExportDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("endDate", dateRange.to.toISOString());
      }

      const url = `/api/export/${format}?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `treasury-export-${new Date().toISOString().split("T")[0]}.${format}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Export Successful",
        description: `Treasury data exported as ${format.toUpperCase()}`,
      });

      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Unable to export treasury data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="default"
          data-testid="button-export"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Treasury Data</DialogTitle>
          <DialogDescription>
            Choose a date range and format to export your treasury data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
            >
              <SelectTrigger id="format" data-testid="select-export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv" data-testid="option-format-csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="pdf" data-testid="option-format-pdf">PDF Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className="justify-start text-left font-normal"
                  data-testid="button-select-start-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    format(dateRange.from, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" data-testid="popover-start-date">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) =>
                    setDateRange((prev) => ({ ...prev, from: date }))
                  }
                  initialFocus
                  data-testid="calendar-start-date"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  className="justify-start text-left font-normal"
                  data-testid="button-select-end-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? (
                    format(dateRange.to, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" data-testid="popover-end-date">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) =>
                    setDateRange((prev) => ({ ...prev, to: date }))
                  }
                  initialFocus
                  data-testid="calendar-end-date"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel-export"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !dateRange.from || !dateRange.to}
            data-testid="button-confirm-export"
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
