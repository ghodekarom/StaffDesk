package com.staffdesk.ems.payroll.service.port;

/**
 * Bridges to the file storage already described in the tech stack doc (local disk
 * in dev, S3/MinIO in prod). Not reimplemented here — if a generic FileStorageService
 * already exists elsewhere in this codebase (e.g. for resumes/profile photos), adapt
 * this port to call it rather than writing a second storage integration.
 */
public interface PdfStoragePort {

    /** Stores the bytes under the given key and returns the value to persist on payslips.pdf_path. */
    String store(String key, byte[] pdfBytes);

    byte[] retrieve(String storedPath);
}
