import { Eyebrow, Verse } from "./Ornaments";

type DuskBannerProps = {
  eyebrow: string;
  title: string;
  verse: { text: string; reference: string };
};

/** The dusk sky at the top of inner public pages (UI.md section 5). The header sits over it. */
export function DuskBanner({ eyebrow, title, verse }: DuskBannerProps) {
  return (
    <section className="dusk dusk-edge overflow-hidden">
      <div className="mx-auto flex max-w-content flex-col gap-2.5 pt-20 gutter pb-14 md:gap-3 md:pt-28 md:pb-20">
        <Eyebrow tone="dark">{eyebrow}</Eyebrow>
        <h1 className="text-h1">{title}</h1>
        <Verse tone="dark" reference={verse.reference} className="max-w-[46ch]">
          {verse.text}
        </Verse>
      </div>
    </section>
  );
}
