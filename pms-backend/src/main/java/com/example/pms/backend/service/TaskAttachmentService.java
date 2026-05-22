package com.example.pms.backend.service;

import com.example.pms.backend.config.UploadProperties;
import com.example.pms.backend.dto.task.TaskAttachmentResponse;
import com.example.pms.backend.entity.Project;
import com.example.pms.backend.entity.Task;
import com.example.pms.backend.entity.TaskAttachment;
import com.example.pms.backend.entity.User;
import com.example.pms.backend.exception.BusinessException;
import com.example.pms.backend.exception.ErrorCode;
import com.example.pms.backend.repository.TaskAttachmentRepository;
import com.example.pms.backend.repository.TaskRepository;
import com.example.pms.backend.security.CurrentUserProvider;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class TaskAttachmentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "png", "jpg", "jpeg", "gif", "webp", "zip",
            "rar", "csv");

    private final TaskAttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final ProjectAccessGuard projectAccessGuard;
    private final CurrentUserProvider currentUserProvider;
    private final UploadProperties uploadProperties;

    @Transactional(readOnly = true)
    public List<TaskAttachmentResponse> list(
            Long workspaceId, Long projectId, Long taskId, String workspaceSlug, String projectSlug) {
        Task task = loadTaskWithAccess(workspaceId, projectId, taskId);
        return attachmentRepository.findByTaskIdWithUploader(task.getId()).stream()
                .map(a -> toResponse(a, task, workspaceSlug, projectSlug))
                .toList();
    }

    @Transactional
    public TaskAttachmentResponse upload(
            Long workspaceId,
            Long projectId,
            Long taskId,
            String workspaceSlug,
            String projectSlug,
            MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Chưa chọn file");
        }
        Task task = loadTaskWithWriteAccess(workspaceId, projectId, taskId);
        User currentUser = currentUserProvider.getCurrentUser();

        if (file.getSize() > uploadProperties.getMaxFileSizeBytes()) {
            throw new BusinessException(ErrorCode.ATTACHMENT_TOO_LARGE);
        }

        String originalName = sanitizeFileName(file.getOriginalFilename());
        String extension = extractExtension(originalName);
        if (extension.isEmpty() || !ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException(ErrorCode.ATTACHMENT_TYPE_NOT_ALLOWED);
        }

        String storedName = UUID.randomUUID() + "_" + originalName;
        Path targetDir = Paths.get(uploadProperties.getStorageDir(), "tasks", String.valueOf(taskId));
        try {
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            String relativePath = "tasks/" + taskId + "/" + storedName;

            TaskAttachment attachment = TaskAttachment.builder()
                    .task(task)
                    .fileName(originalName)
                    .filePath(relativePath)
                    .fileType(file.getContentType() != null ? file.getContentType() : guessMediaType(extension))
                    .fileSize(file.getSize())
                    .uploadedBy(currentUser)
                    .build();
            attachment = attachmentRepository.save(attachment);
            return toResponse(attachment, task, workspaceSlug, projectSlug);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Không lưu được file: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public ResourceDownload download(Long workspaceId, Long projectId, Long taskId, Long attachmentId) {
        loadTaskWithAccess(workspaceId, projectId, taskId);
        TaskAttachment attachment = attachmentRepository
                .findByIdAndTaskId(attachmentId, taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ATTACHMENT_NOT_FOUND));

        Path path = resolveStoragePath(attachment.getFilePath());
        if (!Files.exists(path)) {
            throw new BusinessException(ErrorCode.ATTACHMENT_NOT_FOUND, "File vật lý không còn trên server");
        }
        try {
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new BusinessException(ErrorCode.ATTACHMENT_NOT_FOUND);
            }
            String mediaType =
                    attachment.getFileType() != null ? attachment.getFileType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
            return new ResourceDownload(resource, attachment.getFileName(), mediaType);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.ATTACHMENT_NOT_FOUND);
        }
    }

    @Transactional
    public void delete(Long workspaceId, Long projectId, Long taskId, Long attachmentId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        loadTaskWithAccess(workspaceId, projectId, taskId);

        TaskAttachment attachment = attachmentRepository
                .findByIdAndTaskId(attachmentId, taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ATTACHMENT_NOT_FOUND));

        boolean canDelete = attachment.getUploadedBy().getId().equals(currentUser.getId())
                || projectAccessGuard.canManageProject(project, currentUser);
        if (!canDelete) {
            throw new BusinessException(ErrorCode.ATTACHMENT_FORBIDDEN);
        }

        Path path = resolveStoragePath(attachment.getFilePath());
        attachmentRepository.delete(attachment);
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            /* removed from DB */
        }
    }

    public record ResourceDownload(Resource resource, String fileName, String contentType) {}

    private Task loadTaskWithAccess(Long workspaceId, Long projectId, Long taskId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectAccess(project, currentUser.getId());
        return taskRepository
                .findByIdAndProjectIdWithDetails(taskId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
    }

    private Task loadTaskWithWriteAccess(Long workspaceId, Long projectId, Long taskId) {
        Project project = projectAccessGuard.loadProject(workspaceId, projectId);
        User currentUser = currentUserProvider.getCurrentUser();
        projectAccessGuard.requireProjectWriteAccess(project, currentUser.getId());
        return taskRepository
                .findByIdAndProjectIdWithDetails(taskId, projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
    }

    private Path resolveStoragePath(String relativePath) {
        return Paths.get(uploadProperties.getStorageDir()).resolve(relativePath).normalize();
    }

    private TaskAttachmentResponse toResponse(
            TaskAttachment a, Task task, String workspaceSlug, String projectSlug) {
        String downloadUrl = "/api/workspaces/" + workspaceSlug + "/projects/" + projectSlug + "/tasks/"
                + task.getId() + "/attachments/" + a.getId() + "/download";
        return TaskAttachmentResponse.builder()
                .id(a.getId())
                .taskId(task.getId())
                .fileName(a.getFileName())
                .fileType(a.getFileType())
                .fileSize(a.getFileSize())
                .uploadedByUserId(a.getUploadedBy().getId())
                .uploadedByUsername(a.getUploadedBy().getUsername())
                .downloadUrl(downloadUrl)
                .createdAt(a.getCreatedAt())
                .build();
    }

    private String sanitizeFileName(String name) {
        if (name == null || name.isBlank()) {
            return "file";
        }
        String base = Paths.get(name).getFileName().toString();
        return base.replaceAll("[^a-zA-Z0-9._\\-]", "_");
    }

    private String extractExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String guessMediaType(String extension) {
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "zip" -> "application/zip";
            default -> MediaType.APPLICATION_OCTET_STREAM_VALUE;
        };
    }
}
