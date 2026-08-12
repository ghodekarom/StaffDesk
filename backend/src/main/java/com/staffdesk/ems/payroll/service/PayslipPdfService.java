package com.staffdesk.ems.payroll.service;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.staffdesk.ems.payroll.entity.Payslip;
import com.staffdesk.ems.payroll.entity.PayslipEarning;
import com.staffdesk.ems.payroll.exception.PayrollCalculationException;
import com.staffdesk.ems.payroll.service.port.PdfStoragePort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

/**
 * Generates the payslip PDF at the time a payslip is finalized (called from
 * PayrollRunService right after a payslip is saved) and stores it via
 * {@link PdfStoragePort}, per §6. Uses OpenPDF (com.github.librepdf:openpdf) —
 * confirm the dependency is in pom.xml before building.
 *
 * OpenPDF kept iText 4's legacy package name for drop-in compatibility, hence the
 * {@code com.lowagie.text.*} imports above rather than anything with "openpdf" in
 * the package — that's expected, not a mistake.
 */
@Service
public class PayslipPdfService {

    private final PdfStoragePort pdfStoragePort;

    public PayslipPdfService(PdfStoragePort pdfStoragePort) {
        this.pdfStoragePort = pdfStoragePort;
    }

    public String generateAndStore(Payslip payslip, String employeeDisplayName) {
        byte[] pdfBytes = render(payslip, employeeDisplayName);
        String key = "payslips/%d/%d.pdf".formatted(payslip.getPayrollRun().getId(), payslip.getEmployeeId());
        return pdfStoragePort.store(key, pdfBytes);
    }

    private byte[] render(Payslip payslip, String employeeDisplayName) {
        try {
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);

            String monthName = Month.of(payslip.getPayrollRun().getPeriodMonth())
                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            document.add(new Paragraph("Payslip — " + monthName + " " + payslip.getPayrollRun().getPeriodYear(), titleFont));
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Employee: " + employeeDisplayName, valueFont));
            document.add(new Paragraph("Employee ID: " + payslip.getEmployeeId(), valueFont));
            document.add(new Paragraph(
                    "Working days: " + payslip.getWorkingDays() + "   |   Paid days: " + payslip.getPaidDays(),
                    valueFont));
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Earnings", labelFont));
            PdfPTable earningsTable = twoColumnTable();
            for (PayslipEarning earning : payslip.getEarnings()) {
                addRow(earningsTable, earning.getComponentName(), earning.getAmount(), valueFont);
            }
            addRow(earningsTable, "GROSS EARNINGS", payslip.getGrossEarnings(), boldValueFont);
            document.add(earningsTable);
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Deductions", labelFont));
            PdfPTable deductionsTable = twoColumnTable();
            addRow(deductionsTable, "PF (Employee)", payslip.getPfEmployee(), valueFont);
            addRow(deductionsTable, "ESI (Employee)", payslip.getEsiEmployee(), valueFont);
            addRow(deductionsTable, "Professional Tax", payslip.getProfessionalTax(), valueFont);
            addRow(deductionsTable, "TDS", payslip.getTds(), valueFont);
            addRow(deductionsTable, "TOTAL DEDUCTIONS", payslip.getTotalDeductions(), boldValueFont);
            document.add(deductionsTable);
            document.add(Chunk.NEWLINE);

            Paragraph netPay = new Paragraph("NET PAY: " + formatAmount(payslip.getNetPay()), titleFont);
            netPay.setAlignment(Element.ALIGN_RIGHT);
            document.add(netPay);

            document.add(Chunk.NEWLINE);
            Font footnoteFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8);
            document.add(new Paragraph(
                    "Employer PF contribution (not deducted from pay): " + formatAmount(payslip.getPfEmployer())
                            + "   |   Employer ESI contribution: " + formatAmount(payslip.getEsiEmployer()),
                    footnoteFont));

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new PayrollCalculationException(
                    "Failed to generate PDF for payslip (employee " + payslip.getEmployeeId() + ")", e);
        }
    }

    private PdfPTable twoColumnTable() {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 1});
        return table;
    }

    private void addRow(PdfPTable table, String label, BigDecimal amount, Font font) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, font));
        labelCell.setBorder(0);
        PdfPCell amountCell = new PdfPCell(new Paragraph(formatAmount(amount), font));
        amountCell.setBorder(0);
        amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(labelCell);
        table.addCell(amountCell);
    }

    private String formatAmount(BigDecimal amount) {
        return "\u20B9 " + amount.toPlainString();
    }
}
