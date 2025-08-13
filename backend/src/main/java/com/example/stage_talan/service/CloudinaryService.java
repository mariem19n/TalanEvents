package com.example.stage_talan.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public String uploadImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return (String) uploadResult.get("secure_url");
    }

    public void deleteImage(String imageUrl) throws IOException {
        // Trouver le segment après "/upload/"
        String uploadSegment = "/upload/";
        int index = imageUrl.indexOf(uploadSegment);
        if (index == -1) {
            throw new IllegalArgumentException("URL invalide : '/upload/' introuvable.");
        }

        String afterUpload = imageUrl.substring(index + uploadSegment.length());

        // Supprimer "vXXXXXXX/" (le timestamp Cloudinary)
        if (afterUpload.startsWith("v") && afterUpload.contains("/")) {
            afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
        }

        // Supprimer l'extension .avif, .jpg, .png, etc.
        String publicId = afterUpload.substring(0, afterUpload.lastIndexOf('.'));

        // Supprimer depuis Cloudinary
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

}
