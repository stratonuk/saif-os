import { ImageResponse } from "next/og";

export const runtime = "edge";

function AppIcon({ size }: { size: number }) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.45);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)",
          borderRadius: radius,
          color: "white",
          fontSize,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        S
      </div>
    ),
    { width: size, height: size }
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await context.params;
  const size = Number.parseInt(sizeParam, 10);

  if (![192, 512].includes(size)) {
    return new Response("Invalid size", { status: 404 });
  }

  return AppIcon({ size });
}
