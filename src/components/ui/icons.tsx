import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7 };

export function ArrowRight(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 12h14M14 7l5 5-5 5" /></svg>;
}
export function ArrowDown(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 5v14M7 14l5 5 5-5" /></svg>;
}
export function Github(props: IconProps) {
  return <svg {...base} {...props}><path d="M15 22v-3.9c.04-1-.35-1.95-1.1-2.6 3.6-.4 7.4-1.77 7.4-8A6.2 6.2 0 0 0 19.65 3c.16-.92.09-1.86-.2-2.75 0 0-1.3-.42-4.45 1.7a15.4 15.4 0 0 0-8 0C3.85-.17 2.55.25 2.55.25A7.3 7.3 0 0 0 2.35 3 6.2 6.2 0 0 0 .7 7.5c0 6.22 3.8 7.6 7.4 8-.74.64-1.13 1.58-1.1 2.58V22" /><path d="M7 19c-3 .92-3-1.5-4.2-2" /></svg>;
}
export function Menu(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}
export function Close(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}
export function Play(props: IconProps) {
  return <svg {...base} {...props}><path d="m9 7 8 5-8 5Z" /></svg>;
}
export function Rotate(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M18.2 15a7 7 0 0 1-11.6 1.5L4 12M20 12l-2.6-4.5A7 7 0 0 0 5.8 9" /></svg>;
}
export function ServerIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="3" width="16" height="7" rx="2" /><rect x="4" y="14" width="16" height="7" rx="2" /><path d="M8 6.5h.01M8 17.5h.01M12 6.5h5M12 17.5h5" /></svg>;
}
export function MonitorIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;
}
export function DatabaseIcon(props: IconProps) {
  return <svg {...base} {...props}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></svg>;
}
export function SparkIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m12 2 1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" /></svg>;
}
