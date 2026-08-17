import { useState } from "react";
import { FileBarChart, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reportsApi, saveBlob } from "@/lib/api";

export default function Reports() {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await reportsApi.downloadPatients();
      saveBlob(blob, `patients-report-${Date.now()}.pdf`);
      toast.success("Report downloaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate report"
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Server-side PDF generation with rate limiting.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              Patient report
            </CardTitle>
            <CardDescription>
              A PDF listing every patient with their DOB, appointment count, and
              prescription count. Generated on the server with PDFKit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">PDF · A4</Badge>
              <Badge variant="secondary">All patients</Badge>
              <Badge variant="secondary">5 req / min</Badge>
            </div>
            <Button onClick={handleDownload} disabled={downloading}>
              <Download className="h-4 w-4" />
              {downloading ? "Generating…" : "Download PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}