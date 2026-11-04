import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { CHAPEL_SVG, svgDataUri } from "@/lib/ogArt";

// The share preview for every page (Facebook, WhatsApp, X, iMessage). Built once at build time.

export const alt =
  "Healing Prayer North-West: Bring what is on your heart. One-on-one prayer sessions, with three lit candles in a chapel archway.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read once when this file loads (as in the Next.js docs), so the image is built at build time.
const font = (file: string) => readFileSync(join(process.cwd(), "assets/og", file));
const cormorant = font("cormorant-600.ttf");
const cormorantItalic = font("cormorant-600-italic.ttf");
const cinzel = font("cinzel-600.ttf");
const garamondItalic = font("eb-garamond-400-italic.ttf");

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 80px",
        background: "linear-gradient(180deg, #24142f 0%, #45285a 40%, #8d566c 78%, #dca066 100%)",
        color: "#fff7ea",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="26" height="36" viewBox="0 0 22 30">
            <path d="M11 1v28M3 9h16" stroke="#f0c96a" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <div
            style={{
              fontFamily: "Cinzel",
              fontSize: 22,
              letterSpacing: 6,
              color: "#f0c96a",
            }}
          >
            HEALING PRAYER · NORTH-WEST
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontFamily: "Cormorant",
            fontSize: 92,
            lineHeight: 1,
            marginTop: 34,
          }}
        >
          <span>Bring what is on&nbsp;</span>
          <span style={{ fontStyle: "italic", color: "#f6d58a" }}>your heart.</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 34,
            paddingLeft: 20,
            borderLeft: "2px solid rgba(240, 201, 106, 0.7)",
          }}
        >
          <div style={{ fontFamily: "EB Garamond", fontStyle: "italic", fontSize: 32 }}>
            “Pray one for another, that ye may be healed.”
          </div>
          <div
            style={{
              fontFamily: "Cinzel",
              fontSize: 18,
              letterSpacing: 4,
              color: "#f0c96a",
              marginTop: 8,
            }}
          >
            JAMES 5:16
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            alignSelf: "flex-start",
            padding: "14px 28px",
            borderRadius: 999,
            background: "#c9962e",
            color: "#24142f",
            fontSize: 26,
            fontFamily: "Cinzel",
            letterSpacing: 2,
          }}
        >
          Book a prayer session
        </div>
      </div>
      <img src={svgDataUri(CHAPEL_SVG)} width={340} height={420} alt="" />
    </div>,
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: cormorant, style: "normal", weight: 600 },
        { name: "Cormorant", data: cormorantItalic, style: "italic", weight: 600 },
        { name: "Cinzel", data: cinzel, style: "normal", weight: 600 },
        { name: "EB Garamond", data: garamondItalic, style: "italic", weight: 400 },
      ],
    },
  );
}
