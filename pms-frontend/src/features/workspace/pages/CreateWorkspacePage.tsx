import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Sparkles } from "lucide-react";
import { ApiClientError } from "@/shared/api/client";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { WORKSPACE_COLOR_PRESETS } from "@/shared/config/workspace-options";
import { useAuth } from "@/shared/context/AuthContext";
import { useToast } from "@/shared/context/ToastContext";
import { notifyWorkspacesChanged } from "@/shared/events/appEvents";
import { workspacePath } from "@/shared/routes/paths";
import { canCreateWorkspace } from "@/shared/utils/workspacePermissions";
import { workspaceApi } from "../api/workspaceApi";
import { WorkspaceCreateForm } from "../components/create-workspace/WorkspaceCreateForm";
import {
  WorkspaceCreatePreview,
  type WorkspaceCreatePreviewState,
} from "../components/create-workspace/WorkspaceCreatePreview";
import { guessWorkspaceCode } from "../utils/guessWorkspaceCode";

const initialState: WorkspaceCreatePreviewState = {
  name: "",
  description: "",
  themeColor: WORKSPACE_COLOR_PRESETS[0],
  logoPreview: null,
  privacyMode: "PRIVATE",
  timezone: "Asia/Ho_Chi_Minh",
};

export function CreateWorkspacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const canCreate = canCreateWorkspace(user);

  const [form, setForm] = useState<WorkspaceCreatePreviewState>(initialState);
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const logoFileRef = useRef<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const codeHint = useMemo(
    () => (showAdvanced && code.trim() ? code.trim().toUpperCase() : guessWorkspaceCode(form.name)),
    [code, form.name, showAdvanced],
  );

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  function handleLogoFileSelect(file: File | null) {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    logoFileRef.current = file;
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  if (!canCreate) {
    return <Navigate to="/workspaces" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const created = await workspaceApi.create({
        name: form.name,
        description: form.description.trim() || undefined,
        privacyMode: form.privacyMode,
        themeColor: form.themeColor,
        timezone: form.timezone,
        code: showAdvanced && code.trim() ? code.trim() : undefined,
        slug: showAdvanced && slug.trim() ? slug.trim() : undefined,
      });

      if (logoFileRef.current) {
        try {
          await workspaceApi.uploadLogo(created.slug, logoFileRef.current);
        } catch (err) {
          toast.error(
            err instanceof ApiClientError
              ? err.message
              : "Đã tạo phòng ban nhưng không tải được logo — thử lại trên trang chi tiết",
          );
        }
      }

      toast.success("Đã tạo phòng ban thành công");
      notifyWorkspacesChanged({ workspaceId: created.id });
      navigate(workspacePath(created.slug), { replace: true });
    } catch (err) {
      setSubmitError(
        err instanceof ApiClientError ? err.message : "Không thể tạo phòng ban",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const previewState: WorkspaceCreatePreviewState = {
    ...form,
    logoPreview,
  };

  return (
    <div className="pb-24 lg:pb-8">
      <div
        className="-mx-6 -mt-2 mb-8 px-6 py-10 md:-mx-8 md:px-8 md:py-12"
        style={{
          background:
            "linear-gradient(120deg, #2563eb18 0%, transparent 50%), linear-gradient(180deg, #f8fafc 0%, transparent 100%)",
        }}
      >
        <PageHeader
          breadcrumbs={[
            { label: "Tổng quan", to: "/" },
            { label: "Phòng ban", to: "/workspaces" },
            { label: "Tạo mới" },
          ]}
          title="Tạo phòng ban (workspace)"
          description="Không gian làm việc cho một bộ phận — chứa dự án, thành viên và quyền truy cập. Chỉ admin hệ thống được tạo."
          actions={
            <Link to="/workspaces">
              <Button type="button" variant="secondary" className="gap-2 rounded-xl">
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Hủy
              </Button>
            </Link>
          }
        />
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" />
          <Building2 className="h-3.5 w-3.5" />
          Thiết lập không gian làm việc để quản lý dự án, thành viên và quyền truy cập tập trung.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <WorkspaceCreateForm
            error={submitError}
            state={form}
            logoPreview={logoPreview}
            showAdvanced={showAdvanced}
            code={code}
            slug={slug}
            onStateChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            onLogoFileSelect={handleLogoFileSelect}
            onShowAdvancedChange={setShowAdvanced}
            onCodeChange={setCode}
            onSlugChange={setSlug}
            onSubmit={handleSubmit}
          />
          <div className="mt-6 hidden justify-end gap-3 lg:flex">
            <Link to="/workspaces">
              <Button type="button" variant="secondary" className="rounded-xl px-5">
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              form="create-workspace-form"
              disabled={submitting}
              className="rounded-xl px-6 shadow-md shadow-brand-600/20"
            >
              {submitting ? "Đang tạo phòng ban…" : "Tạo phòng ban"}
            </Button>
          </div>
        </div>
        <div className="lg:col-span-2">
          <WorkspaceCreatePreview state={previewState} codeHint={codeHint} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg gap-3">
          <Link to="/workspaces" className="flex-1">
            <Button type="button" variant="secondary" className="w-full rounded-xl">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            form="create-workspace-form"
            disabled={submitting}
            className="flex-[2] rounded-xl"
          >
            {submitting ? "Đang tạo…" : "Tạo phòng ban"}
          </Button>
        </div>
      </div>
    </div>
  );
}
