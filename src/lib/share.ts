import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

// Turns an HTML string into a PDF and opens the OS share sheet (save / email / WhatsApp…).
export async function sharePdf(html: string, title = "document"): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: title, UTI: "com.adobe.pdf" });
  }
}

// Writes a CSV string to a temp file and opens the share sheet.
export async function shareCsv(filename: string, csv: string): Promise<void> {
  const file = new File(Paths.cache, filename);
  file.write(csv); // creates (or overwrites) and writes in one call
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: "text/csv", dialogTitle: filename });
  }
}
