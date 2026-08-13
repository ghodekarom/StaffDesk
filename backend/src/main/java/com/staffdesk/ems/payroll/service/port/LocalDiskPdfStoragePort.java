package com.staffdesk.ems.payroll.service.port;

import com.staffdesk.ems.payroll.exception.PayrollCalculationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Local-disk storage, matching §6's "local disk in dev, S3/object storage in prod."
 * Swap this out for an S3/MinIO-backed implementation before deploying — this one
 * won't survive a container restart or work across multiple app instances.
 *
 * Override the base directory via application.yml / application.properties:
 * payroll.pdf.storage-dir: /some/absolute/path
 */
//@Component
public class LocalDiskPdfStoragePort implements PdfStoragePort {

    @Value("${payroll.pdf.storage-dir:./storage/payslips}")
    private String storageDir;

    @Override
    public String store(String key, byte[] pdfBytes) {
        try {
            Path path = Paths.get(storageDir, key);
            Files.createDirectories(path.getParent());
            Files.write(path, pdfBytes);
            return path.toString();
        } catch (IOException e) {
            throw new PayrollCalculationException("Failed to store payslip PDF at key: " + key, e);
        }
    }

    @Override
    public byte[] retrieve(String storedPath) {
        try {
            return Files.readAllBytes(Paths.get(storedPath));
        } catch (IOException e) {
            throw new PayrollCalculationException("Failed to read payslip PDF at path: " + storedPath, e);
        }
    }
}
