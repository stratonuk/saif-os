import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const ALLOWED = new Set([192, 512]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await context.params;
  const size = Number.parseInt(sizeParam, 10);

  if (!ALLOWED.has(size)) {
    return new Response("Invalid size", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "brand", `icon-${size}.png`);
  const buffer = await readFile(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
