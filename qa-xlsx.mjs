import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const outputDir = process.env.QA_EXPORT_DIR;
const artifactToolPath = process.env.ARTIFACT_TOOL_PATH;
if (!outputDir || !artifactToolPath) throw new Error('QA_EXPORT_DIR und ARTIFACT_TOOL_PATH werden benötigt.');

const { FileBlob, SpreadsheetFile } = await import(pathToFileURL(artifactToolPath).href);
const names = (await fs.readdir(outputDir)).filter(name => name.endsWith('.xlsx')).sort();
if (names.length !== 4) throw new Error('Vier XLSX-Dateien erwartet, gefunden: ' + names.length);

for (const name of names) {
  const input = await FileBlob.load(path.join(outputDir, name));
  const workbook = await SpreadsheetFile.importXlsx(input);
  const sheets = await workbook.inspect({ kind: 'sheet', include: 'id,name', maxChars: 3000 });
  const formulas = await workbook.inspect({ kind: 'formula', maxChars: 5000, options: { maxResults: 200 } });
  const formulaText = JSON.stringify(formulas);
  if (/#DIV\/0!|#REF!|#VALUE!|#NAME\?|#N\/A/.test(formulaText)) throw new Error(name + ': sichtbarer Formelfehler');
  console.log('OK ' + name + ' ' + JSON.stringify(sheets));
}

