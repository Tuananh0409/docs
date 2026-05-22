import type { ProjectListSort } from "./projectListUtils";

const FILTER_KEY = "pms.projects.priorityFilter";
const SORT_KEY = "pms.projects.sort";

export function readProjectPriorityFilter(): string {
  try {
    return localStorage.getItem(FILTER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function persistProjectPriorityFilter(value: string) {
  localStorage.setItem(FILTER_KEY, value);
}

export function readProjectListSort(): ProjectListSort {
  try {
    const raw = localStorage.getItem(SORT_KEY);
    return raw === "name" ? "name" : "priority";
  } catch {
    return "priority";
  }
}

export function persistProjectListSort(value: ProjectListSort) {
  localStorage.setItem(SORT_KEY, value);
}
