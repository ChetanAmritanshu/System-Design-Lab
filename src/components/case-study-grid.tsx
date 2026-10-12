import { caseStudies } from "@/data/topics";
import { ArrowRight } from "@/components/ui/icons";
import Link from "next/link";

export function CaseStudyGrid() {
  return (
    <div className="case-study-grid">
      {caseStudies.map((study, index) => {
        const card=(<article className={`case-card ${study.available ? "case-card--active" : ""} ${index === 4 ? "case-card--wide" : ""}`}>
          <div className="case-top"><span>{study.mark}</span><small>CASE {String(index + 1).padStart(2, "0")}</small></div>
          <div><h3>{study.title}</h3><p>{study.problem}</p></div>
          <span className="preview-link">{study.available ? "Enter case study" : "Coming soon"} <ArrowRight /></span>
        </article>);const className=index===4?"case-item--wide":undefined;return study.available?<Link className={className} href={study.slug} prefetch={false} key={study.title}>{card}</Link>:<div className={className} aria-label={`${study.title}, coming soon`} key={study.title}>{card}</div>
      })}
    </div>
  );
}
