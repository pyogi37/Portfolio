import { data } from "@/lib/data";
import { Figure, Notes } from "@/components/Figure";
import { IArrow } from "@/components/Icons";

/* Table 1: two educations, set side by side as a ledger rather than a degree card and a certificate list. */
export function HowIGotHere() {
  const { formal, selfDirected, journey } = data.education;
  const f = formal[0];
  return (
    <Figure
      id="how-i-got-here"
      n={1}
      kind="Table"
      title="Two educations, one method."
      lede="Formal training in how human systems behave; self-directed training in how to build technical ones. The first is why the second was learnable."
      aside={
        <span>
          <span className="text-curve-b">Human systems</span> → software systems → <span className="text-curve-a">intelligent systems</span>
        </span>
      }
    >
      <div>
        <table className="ledger">
          <thead>
            <tr>
              <th className="w-[18%]"></th>
              <th className="w-[41%]">
                <span className="text-curve-b">Formal</span>
              </th>
              <th className="w-[41%]">
                <span className="text-curve-a">Self-directed</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fig-label">Programme</td>
              <td data-label="Formal">
                <div className="font-serif text-xl">{f.degree}</div>
                <div className="text-ink-2">
                  {f.institution}, <span className="tnum">{f.period}</span>
                </div>
              </td>
              <td data-label="Self-directed">
                {selfDirected.map((s) => (
                  <div key={s.id} className="mb-2 last:mb-0">
                    <div className="font-serif text-xl">{s.program}</div>
                    <div className="text-ink-2">
                      {s.institution}, <span className="tnum">{s.period}</span>
                    </div>
                  </div>
                ))}
              </td>
            </tr>
            <tr>
              <td className="fig-label">What it trained</td>
              <td data-label="Formal" className="text-ink-2">{f.themes.join(" · ")}</td>
              <td data-label="Self-directed" className="text-ink-2">{selfDirected.flatMap((s) => s.themes).join(" · ")}</td>
            </tr>
            <tr>
              <td className="fig-label">Carried forward</td>
              <td data-label="Formal" className="text-ink-2">Reading incentives before reading requirements. Treating an organization as a system with its own equilibrium.</td>
              <td data-label="Self-directed" className="text-ink-2">Learning a stack by shipping in it. Comfort with being the least credentialed person in the room and the most prepared.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* The transition, as a single annotated line rather than eight cards. */}
      <ol className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-3 text-[15px]">
        {journey.map((j, i) => (
          <li key={j.step} className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full border-2 ${j.kind === "humanities" ? "border-curve-b" : "border-curve-a"}`} style={{ background: i === journey.length - 1 ? "var(--curve-a)" : "transparent" }} />
            <span title={j.detail}>{j.step}</span>
            {i < journey.length - 1 && <IArrow className="text-ink-3" width={14} height={14} />}
          </li>
        ))}
      </ol>
      <Notes
        items={[
          { n: "a", text: "Dates and programmes from the resume. No CS degree; nothing here is a certification list." },
          { n: "b", text: "The message is not “studied something unrelated and became an engineer.” It is “learned to think about human systems first, then taught himself to build technical ones.”" },
        ]}
      />
    </Figure>
  );
}
