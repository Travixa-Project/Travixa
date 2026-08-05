package com.tourms.packages.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads/packages");
        File file = uploadDir.toFile();
        if (!file.exists()) {
            file.mkdirs();
        }
        String uploadPath = file.getAbsolutePath();

        registry.addResourceHandler("/uploads/packages/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
