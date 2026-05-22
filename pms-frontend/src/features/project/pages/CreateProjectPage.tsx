import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { workspaceApi } from "@/features/workspace/api/workspaceApi";
import type { Member, Workspace } from "@/features/workspace/types";
import { ApiClientError } from "@/shared/api/client";
import { ErrorAlert } from "@/shared/components/feedback/ErrorAlert";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import {
  DEFAULT_PROJECT_PRIORITY,
  PROJECT_COLOR_PRESETS,
} from "@/shared/config/project-options";
import { useAuth } from "@/shared/context/AuthContext";
import { useToast } from "@/shared/context/ToastContext";
import { notifyProjectsChanged } from "@/shared/events/appEvents";
import { projectPath, workspacePath } from "@/shared/routes/paths";
import {
  createPendingFileMeta,
  type PendingFileMeta,
} from "@/shared/components/files/pendingFiles";
import { projectApi } from "../api/projectApi";
import { ProjectCreateForm } from "../components/create-project/ProjectCreateForm";
import {
  ProjectCreatePreview,
  type ProjectCreatePreviewState,
} from "../components/create-project/ProjectCreatePreview";
const initialFormState = (leadId: string): ProjectCreatePreviewState => ({
  name: "",
  description: "",
  themeColor: PROJECT_COLOR_PRESETS[0],
  statusName: "Active",
  priorityName: DEFAULT_PROJECT_PRIORITY,
  startDate: "",
  endDate: "",
  privacyMode: "PRIVATE",
  projectLeadUserId: leadId,
});

export function CreateProjectPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState<ProjectCreatePreviewState>(() =>
    initialFormState(user?.id ? String(user.id) : ""),
  );
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingMeta, setPendingMeta] = useState<PendingFileMeta[]>([]);
  const pendingFilesRef = useRef<Map<string, File>>(new Map());

  function addPendingFiles(files: File[]) {
    const added = files.map((file) => {
      const meta = createPendingFileMeta(file);
      pendingFilesRef.current.set(meta.id, file);
      return meta;
    });
    setPendingMeta((prev) => [...prev, ...added]);
  }

  function removePendingFile(id: string) {
    pendingFilesRef.current.delete(id);
    setPendingMeta((prev) => prev.filter((m) => m.id !== id));
  }

  const canCreate =
    workspace?.myRole?.toLowerCase() === "admin" ||
    workspace?.myRole?.toLowerCase() === "member";

  useEffect(() => {
    if (!workspaceSlug) return;
    let cancelled = false;

    async function load() {
      setPageLoading(true);
      setPageError("");
      try {
        const [ws, mem] = await Promise.all([
          workspaceApi.get(workspaceSlug!),
          workspaceApi.listMembers(workspaceSlug!),
        ]);
        if (cancelled) return;
        setWorkspace(ws);
        setMembers(mem);
        if (user?.id) {
          setForm((prev) => ({ ...prev, projectLeadUserId: String(user.id) }));
        }
      } catch (err) {
        if (!cancelled) {
          setPageError(
            err instanceof ApiClientError ? err.message : "Không tải được phòng ban",
          );
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
          setLoadingMembers(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [workspaceSlug, user?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workspace) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const created = await projectApi.create(workspace.slug, {
        name: form.name,
        description: form.description.trim() || undefined,
        projectLeadUserId: form.projectLeadUserId
          ? Number(form.projectLeadUserId)
          : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        statusName: form.statusName,
        priorityName: form.priorityName,
        privacyMode: form.privacyMode,
        colorCode: form.themeColor,
        code: showAdvanced && code.trim() ? code.trim() : undefined,
        slug: showAdvanced && slug.trim() ? slug.trim() : undefined,
      });
      let uploadErrors = 0;
      let lastUploadError = "";
      for (const meta of pendingMeta) {
        const file = pendingFilesRef.current.get(meta.id);
        if (!file) continue;
        try {
          await projectApi.uploadAttachment(workspace.slug, created.slug, file);
        } catch (err) {
          uploadErrors += 1;
          if (err instanceof ApiClientError) lastUploadError = err.message;
        }
      }

      if (pendingMeta.length === 0) {
        toast.success("Đã tạo dự án thành công");
      } else if (uploadErrors === 0) {
        toast.success(
          `Đã tạo dự án và tải lên ${pendingMeta.length} tệp đính kèm`,
        );
      } else if (uploadErrors === pendingMeta.length) {
        toast.success("Đã tạo dự án");
        toast.error(
          lastUploadError || "Không tải được tệp đính kèm — thêm lại trên trang chi tiết dự án",
        );
      } else {
        toast.success("Đã tạo dự án");
        toast.error(
          lastUploadError ||
            `${uploadErrors}/${pendingMeta.length} file không tải lên được — thử lại trên trang chi tiết`,
        );
      }

      notifyProjectsChanged({ workspaceId: workspace.id });
      navigate(projectPath(workspace.slug, created.slug, "backlog"), { replace: true });
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : "Không thể tạo dự án");
    } finally {
      setSubmitting(false);
    }
  }

  if (pageLoading) return <LoadingState />;

  if (pageError || !workspace) {
    return (
      <>
        <PageHeader title="Tạo dự án" breadcrumbs={[{ label: "Phòng ban", to: "/workspaces" }]} />
        <ErrorAlert message={pageError || "Phòng ban không tồn tại"} />
        <Link to="/workspaces" className="mt-4 inline-block text-sm font-medium text-brand-600">
          ← Quay lại
        </Link>
      </>
    );
  }

  if (!canCreate) {
    return (
      <>
        <PageHeader
          title="Tạo dự án"
          breadcrumbs={[
            { label: "Phòng ban", to: "/workspaces" },
            { label: workspace.name, to: workspacePath(workspace.slug) },
          ]}
        />
        <ErrorAlert message="Bạn không có quyền tạo dự án trong phòng ban này." />
        <Link
          to={workspacePath(workspace.slug)}
          className="mt-4 inline-block text-sm font-medium text-brand-600"
        >
          ← Quay lại phòng ban
        </Link>
      </>
    );
  }

  const theme = workspace.themeColor ?? "#2563eb";

  return (
    <div className="pb-24 lg:pb-8">
      <div
        className="-mx-6 -mt-2 mb-8 px-6 py-10 md:-mx-8 md:px-8 md:py-12"
        style={{
          background: `linear-gradient(120deg, ${theme}22 0%, transparent 45%), linear-gradient(180deg, #f8fafc 0%, transparent 100%)`,
        }}
      >
        <PageHeader
          breadcrumbs={[
            { label: "Tổng quan", to: "/" },
            { label: "Phòng ban", to: "/workspaces" },
            { label: workspace.name, to: workspacePath(workspace.slug) },
            { label: "Tạo dự án" },
          ]}
          title="Tạo dự án mới"
          description={`Khởi tạo dự án trong phòng ban ${workspace.name}. Điền thông tin bên dưới — giống trải nghiệm full-page trên Asana hay Jira.`}
          actions={
            <Link to={workspacePath(workspace.slug)}>
              <Button type="button" variant="secondary" className="gap-2 rounded-xl">
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Hủy
              </Button>
            </Link>
          }
        />
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" />
          Có thể đính kèm spec, báo cáo ngay trong form — file lưu vào dự án sau khi bấm Tạo.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <ProjectCreateForm
            members={members}
            loadingMembers={loadingMembers}
            error={submitError}
            state={form}
            showAdvanced={showAdvanced}
            code={code}
            slug={slug}
            onStateChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            onShowAdvancedChange={setShowAdvanced}
            onCodeChange={setCode}
            onSlugChange={setSlug}
            pendingFiles={pendingMeta}
            onFilesAdd={addPendingFiles}
            onFileRemove={removePendingFile}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
          <div className="mt-6 hidden justify-end gap-3 lg:flex">
            <Link to={workspacePath(workspace.slug)}>
              <Button type="button" variant="secondary" className="rounded-xl px-5">
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              form="create-project-form"
              disabled={submitting || loadingMembers}
              className="rounded-xl px-6 shadow-md shadow-brand-600/20"
            >
              {submitting
                ? pendingMeta.length > 0
                  ? "Đang tạo và tải file…"
                  : "Đang tạo dự án…"
                : "Tạo dự án"}
            </Button>
          </div>
        </div>
        <div className="lg:col-span-2">
          <ProjectCreatePreview
            workspaceName={workspace.name}
            members={members}
            state={form}
            attachmentCount={pendingMeta.length}
          />
        </div>
      </div>

      {/* Thanh hành động cố định — mobile & tablet */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg gap-3">
          <Link to={workspacePath(workspace.slug)} className="flex-1">
            <Button type="button" variant="secondary" className="w-full rounded-xl">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            form="create-project-form"
            disabled={submitting || loadingMembers}
            className="flex-[2] rounded-xl"
          >
            {submitting
              ? pendingMeta.length > 0
                ? "Đang tạo và tải file…"
                : "Đang tạo…"
              : "Tạo dự án"}
          </Button>
        </div>
      </div>
    </div>
  );
}
