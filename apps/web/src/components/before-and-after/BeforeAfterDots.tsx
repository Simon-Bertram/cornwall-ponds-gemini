import type { Project } from "../../lib/projects";

type TransformationProject = Pick<Project, "title" | "slug">;

interface BeforeAfterDotsProps {
  projects: TransformationProject[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function BeforeAfterDots({
  projects,
  currentIndex,
  onSelect,
}: BeforeAfterDotsProps) {
  return (
    <div
      class="flex justify-center gap-2 mt-4"
      role="tablist"
      aria-label="Project transformations"
    >
      {projects.map((project, index) => (
        <button
          key={project.slug}
          role="tab"
          aria-selected={index === currentIndex}
          aria-label={`View transformation: ${project.title}`}
          onClick={() => onSelect(index)}
          class={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-base-content ${
            index === currentIndex
              ? "bg-accent-foreground w-6"
              : "bg-base-100/50 w-2 hover:bg-base-100/75"
          }`}
        />
      ))}
    </div>
  );
}

