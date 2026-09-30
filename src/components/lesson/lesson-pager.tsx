import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";

export function LessonPager({ previous, next }: {
  previous?: { number: string; title: string; href: string };
  next: { number: string; title: string; href?: string; copy: string };
}) {
  return (
    <div className="lesson-pager">
      {previous ? <Link className="lesson-pager__previous" href={previous.href}><ArrowRight /><span><small>PREVIOUS · {previous.number}</small><b>{previous.title}</b></span></Link> : <span />}
      {next.href ? <Link className="lesson-pager__next" href={next.href}><span><small>NEXT · {next.number}</small><b>{next.title}</b><em>{next.copy}</em></span><ArrowRight /></Link> : <div className="lesson-pager__next lesson-pager__next--locked"><span><small>NEXT · {next.number} · COMING SOON</small><b>{next.title}</b><em>{next.copy}</em></span><ArrowRight /></div>}
    </div>
  );
}
