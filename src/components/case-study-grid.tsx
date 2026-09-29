import { caseStudies } from "@/data/topics";
import { ArrowRight } from "@/components/ui/icons";

export function CaseStudyGrid() {
  return (
    <div className="case-study-grid">
      {caseStudies.map((study, index) => (
        <article className={`case-card ${index === 4 ? "case-card--wide" : ""}`} key={study.title}>
          <div className="case-top"><span>{study.mark}</span><small>CASE {String(index + 1).padStart(2, "0")}</small></div>
          <div><h3>{study.title}</h3><p>{study.problem}</p></div>
          <span className="preview-link">Preview locked <ArrowRight /></span>
        </article>
      ))}
    </div>
  );
}
