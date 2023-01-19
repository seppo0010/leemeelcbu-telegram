import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js'

export function findCBUsInText (text: string): string[] {
  return Array.from(text.matchAll(/[0-9\- ]+/g))
    .map((res) => res[0].replace(/\D/g, ''))
    .filter((res) => res.length === 22)
}

export async function readImage (f: Buffer): Promise<string[]> {
  return await Tesseract.recognize(
    f,
    'spa'
  ).then(({ data: { text } }) => findCBUsInText(text))
}

export async function readPDF (f: Buffer): Promise<string[]> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: f })
    const pdf = await loadingTask.promise
    let cbus: string[] = []

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1)
      const texts = await page.getTextContent()
      for (const item of texts.items) {
        cbus = [...cbus, ...findCBUsInText((item as { str?: string }).str ?? '')]
      }
    }
    return cbus
  } catch (e) {
    if (e.name === 'InvalidPDFException') return []
    throw e
  }
}

export async function readFile (file: Buffer): Promise<string[]> {
  return (await Promise.all([
    readImage(file),
    readPDF(file)
  ])).flat()
}
