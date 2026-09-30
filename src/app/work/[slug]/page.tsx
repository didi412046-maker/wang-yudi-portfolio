import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/work/ProjectDetail";
import { getProjectDetail } from "@/config/project-details";
import { projects } from "@/config/work";
import "../../work.css";
import "./detail.css";

export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectDetail(slug);
  if (!project) notFound();

  const projectIndex = projects.findIndex((item) => item.slug === slug);
  const nextSlug = projectIndex >= 0 ? projects[projectIndex + 1]?.slug ?? null : null;

  return <ProjectDetail project={project} nextSlug={nextSlug} />;
}
