package com.constructionrental.system.common.service;

import com.constructionrental.system.common.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class UploadService {

    private static final Logger log = LoggerFactory.getLogger(UploadService.class);

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path uploadLocation;

    public UploadService(@Value("${upload.equipment.dir:uploads/equipment}") String uploadDir) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadLocation);
            log.info("Initialized local equipment image upload directory at: {}", this.uploadLocation);
        } catch (IOException e) {
            log.error("Could not create upload directory: {}", this.uploadLocation, e);
        }
    }

    public String storeEquipmentImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded image cannot be empty");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Unsupported image format. Allowed formats: JPG, PNG, WEBP");
        }

        // Validate file extension
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Invalid file extension: ." + extension);
        }

        // Generate unique filename & store locally
        String uniqueFileName = UUID.randomUUID() + "." + extension.toLowerCase();
        Path targetPath = this.uploadLocation.resolve(uniqueFileName).normalize();

        if (!targetPath.startsWith(this.uploadLocation)) {
            throw new BadRequestException("Invalid file path security violation");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored equipment image: {}", uniqueFileName);
            return "/uploads/equipment/" + uniqueFileName;
        } catch (IOException e) {
            log.error("Failed to store image: {}", uniqueFileName, e);
            throw new RuntimeException("Failed to store uploaded image", e);
        }
    }

    public List<String> storeEquipmentImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> storedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                storedUrls.add(storeEquipmentImage(file));
            }
        }
        return storedUrls;
    }

    public boolean deleteEquipmentImage(String relativeUrl) {
        if (relativeUrl == null || !relativeUrl.startsWith("/uploads/equipment/")) {
            return false;
        }

        String fileName = relativeUrl.substring("/uploads/equipment/".length());
        Path targetPath = this.uploadLocation.resolve(fileName).normalize();

        try {
            if (targetPath.startsWith(this.uploadLocation) && Files.exists(targetPath)) {
                Files.delete(targetPath);
                log.info("Deleted equipment image: {}", fileName);
                return true;
            }
        } catch (IOException e) {
            log.warn("Failed to delete equipment image file: {}", fileName, e);
        }
        return false;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }
}
