import type { ProjectSummary } from "@/features/project/types";

export type ProjectListSort = "priority" | "name";

export function filterProjectsByPriority(
  projects: ProjectSummary[],
  priorityFilter: string,
): ProjectSummary[] {
  if (!priorityFilter) return projects;
  const key = priorityFilter.toLowerCase();
  return projects.filter((p) => p.priorityName?.toLowerCase() === key);
}

export function sortProjects(
  projects: ProjectSummary[],
  sort: ProjectListSort,
): ProjectSummary[] {
  const list = [...projects];
  if (sort === "name") {
    return list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }
  return list.sort((a, b) => {
    const wa = a.priorityWeight ?? 0;
    const wb = b.priorityWeight ?? 0;
    if (wb !== wa) return wb - wa;
    return a.name.localeCompare(b.name, "vi");
  });
}

export function applyProjectListView(
  projects: ProjectSummary[],
  priorityFilter: string,
  sort: ProjectListSort,
): ProjectSummary[] {
  return sortProjects(filterProjectsByPriority(projects, priorityFilter), sort);
}
