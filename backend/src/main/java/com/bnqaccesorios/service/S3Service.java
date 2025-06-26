package com.bnqaccesorios.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class S3Service {

    @Value("${AWS_ACCESS_KEY_ID}")
    private String accessKey;
    @Value("${AWS_SECRET_ACCESS_KEY}")
    private String secretKey;
    @Value("${AWS_REGION}")
    private String region;
    @Value("${S3_BUCKET}")
    private String bucket;

    private S3Client s3Client;

    @PostConstruct
    public void init() {
        s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String key = UUID.randomUUID() + extension;
        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();
        s3Client.putObject(putReq, software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));
        // URL pública
        String url = String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, URLEncoder.encode(key, StandardCharsets.UTF_8));
        return url;
    }

    public void deleteFile(String fileUrl) {
        // Extraer el key del archivo desde la URL
        String prefix = String.format("https://%s.s3.%s.amazonaws.com/", bucket, region);
        if (!fileUrl.startsWith(prefix)) return;
        String key = fileUrl.substring(prefix.length());
        try {
            DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteReq);
        } catch (S3Exception e) {
            // Loguear pero no romper la app
            System.err.println("Error al borrar archivo de S3: " + e.awsErrorDetails().errorMessage());
        }
    }
} 