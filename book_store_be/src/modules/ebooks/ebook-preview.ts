import { PDFDocument } from '@cantoo/pdf-lib';

export const PREVIEW_PAGE_LIMIT = 20;

export interface EbookPreview {
  pages: number;
  preview: Uint8Array | null;
}

export function previewPageCount(pages: number): number {
  return Math.min(PREVIEW_PAGE_LIMIT, Math.floor(pages / 2));
}

export async function buildPreview(pdf: Uint8Array): Promise<EbookPreview> {
  const source = await PDFDocument.load(pdf, { password: '' });
  const pages = source.getPageCount();
  const count = previewPageCount(pages);

  if (count === 0) return { pages, preview: null };

  const preview = await PDFDocument.create();
  const copied = await preview.copyPages(source, [...Array(count).keys()]);
  copied.forEach((page) => preview.addPage(page));

  return { pages, preview: await preview.save() };
}
