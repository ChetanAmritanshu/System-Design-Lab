"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { topicGroups } from "@/data/topics";
import { ArrowRight } from "@/components/ui/icons";

export function LearningMap() {
  const reduce = useReducedMotion();
  return (
    <div className="learning-map">
      <div className="map-spine" aria-hidden="true" />
      {topicGroups.map((group, groupIndex) => (
        <motion.section
          className={`map-group map-group--${group.tone}`}
          key={group.id}
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ delay: groupIndex * 0.05, duration: 0.55 }}
        >
          <header className="map-group-header">
            <span className="map-index">0{groupIndex + 1}</span>
            <div><p>{group.eyebrow}</p><h3>{group.label}</h3></div>
            <span className="topic-count">{group.topics.length} modules</span>
          </header>
          <div className="map-track">
            {group.topics.map((item, index) => {
              const content = <><span className="topic-number">{item.number}</span><strong>{item.shortTitle}</strong>{item.available ? <span className="topic-action">Enter lab <ArrowRight /></span> : <span className="coming-soon">Coming soon</span>}</>;
              return item.available ? (
                <Link className="topic-node topic-node--active" href={item.slug} prefetch={false} key={item.number}>{content}</Link>
              ) : (
                <div className="topic-node" key={item.number} aria-label={`${item.title}, coming soon`}><span className="track-dot" style={{ animationDelay: `${index * 120}ms` }} />{content}</div>
              );
            })}
          </div>
        </motion.section>
      ))}
      <div className="map-terminal"><span>30</span><div><b>System Design Communication</b><small>The map ends where the interview begins.</small></div></div>
    </div>
  );
}
