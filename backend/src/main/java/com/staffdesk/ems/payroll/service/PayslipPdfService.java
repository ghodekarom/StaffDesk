package com.staffdesk.ems.payroll.service;

import com.lowagie.text.*;
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
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.Month;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.Locale;

/**
 * Renders the payslip PDF on demand — called from PayslipService#getPdfBytes on
 * every download request. Nothing is persisted here; there is no storage
 * dependency at all. Must stay a pure function of (Payslip, employeeDisplayName):
 * same inputs in, byte-identical PDF out, every time, so a payslip downloaded
 * today looks the same as one downloaded a year from now for the same period.
 * The "Generated on" timestamp on the document therefore comes from
 * payslip.getGeneratedAt() (frozen at payroll-run time) rather than the current
 * render/download time, to preserve that determinism.
 *
 * Uses OpenPDF (com.github.librepdf:openpdf) — confirm the dependency is in
 * pom.xml before building.
 *
 * OpenPDF kept iText 4's legacy package name for drop-in compatibility, hence the
 * {@code com.lowagie.text.*} imports above rather than anything with "openpdf" in
 * the package — that's expected, not a mistake.
 */
@Service
public class PayslipPdfService {

    private static final String COMPANY_NAME = "StaffDesk";
    private static final String COMPANY_ADDRESS = "315, Somwar Peth, Pune";

    private static final Color RULE_COLOR = new Color(60, 60, 60);
    private static final Color TABLE_HEADER_BG = new Color(230, 230, 230);
    private static final Color ROW_ALT_BG = new Color(245, 245, 245);
    private static final Color NET_PAY_BG = new Color(235, 245, 235);
    private static final Color BORDER_COLOR = new Color(200, 200, 200);

    private static final DateTimeFormatter GENERATED_AT_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a").withZone(ZoneId.of("Asia/Kolkata"));

    public byte[] render(Payslip payslip, String employeeDisplayName) {
        try {
            Document document = new Document(PageSize.A4, 40, 40, 45, 45);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            Font companyNameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font companyAddressFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
            Font sectionLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.DARK_GRAY);
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font netPayLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
            Font netPayValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, new Color(20, 90, 50));
            Font footnoteFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.DARK_GRAY);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 7, Color.GRAY);

            // --- Company header ---
            Paragraph companyName = new Paragraph(COMPANY_NAME, companyNameFont);
            companyName.setSpacingAfter(2f);
            document.add(companyName);
            document.add(new Paragraph(COMPANY_ADDRESS, companyAddressFont));

            document.add(ruleBelow());
            document.add(Chunk.NEWLINE);

            // --- Payslip subtitle ---
            String monthName = Month.of(payslip.getPayrollRun().getPeriodMonth())
                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            Paragraph subtitle = new Paragraph(
                    "Payslip for " + monthName + " " + payslip.getPayrollRun().getPeriodYear(), subtitleFont);
            subtitle.setSpacingAfter(10f);
            document.add(subtitle);

            // --- Employee info block ---
            document.add(employeeInfoTable(payslip, employeeDisplayName, sectionLabelFont, valueFont));
            document.add(Chunk.NEWLINE);

            // --- Earnings ---
            document.add(new Paragraph("Earnings", sectionLabelFont));
            document.add(spacer(4f));
            PdfPTable earningsTable = amountTable(tableHeaderFont);
            int row = 0;
            for (PayslipEarning earning : payslip.getEarnings()) {
                addRow(earningsTable, earning.getComponentName(), earning.getAmount(), valueFont, row++ % 2 == 1);
            }
            addTotalRow(earningsTable, "GROSS EARNINGS", payslip.getGrossEarnings(), boldValueFont);
            document.add(earningsTable);
            document.add(Chunk.NEWLINE);

            // --- Deductions ---
            document.add(new Paragraph("Deductions", sectionLabelFont));
            document.add(spacer(4f));
            PdfPTable deductionsTable = amountTable(tableHeaderFont);
            row = 0;
            addRow(deductionsTable, "PF (Employee)", payslip.getPfEmployee(), valueFont, row++ % 2 == 1);
            addRow(deductionsTable, "ESI (Employee)", payslip.getEsiEmployee(), valueFont, row++ % 2 == 1);
            addRow(deductionsTable, "Professional Tax", payslip.getProfessionalTax(), valueFont, row++ % 2 == 1);
            addRow(deductionsTable, "TDS", payslip.getTds(), valueFont, row++ % 2 == 1);
            addTotalRow(deductionsTable, "TOTAL DEDUCTIONS", payslip.getTotalDeductions(), boldValueFont);
            document.add(deductionsTable);
            document.add(Chunk.NEWLINE);

            // --- Net pay strip ---
            document.add(netPayStrip(payslip.getNetPay(), netPayLabelFont, netPayValueFont));
            document.add(Chunk.NEWLINE);

            // --- Employer contribution footnote ---
            document.add(new Paragraph(
                    "Employer PF contribution (not deducted from pay): " + formatAmount(payslip.getPfEmployer())
                            + "   |   Employer ESI contribution: " + formatAmount(payslip.getEsiEmployer()),
                    footnoteFont));

            // --- Footer ---
            document.add(Chunk.NEWLINE);
            document.add(ruleBelow());
            Paragraph footer = new Paragraph(
                    "This is a system-generated payslip and does not require a signature.   |   Generated on "
                            + GENERATED_AT_FORMAT.format(payslip.getGeneratedAt()),
                    footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(6f);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new PayrollCalculationException(
                    "Failed to generate PDF for payslip (employee " + payslip.getEmployeeId() + ")", e);
        }
    }

    private PdfPTable employeeInfoTable(Payslip payslip, String employeeDisplayName, Font labelFont, Font valueFont) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 1});

        addInfoCell(table, "Employee Name", employeeDisplayName, labelFont, valueFont);
        addInfoCell(table, "Employee ID", String.valueOf(payslip.getEmployeeId()), labelFont, valueFont);
        addInfoCell(table, "Working Days", String.valueOf(payslip.getWorkingDays()), labelFont, valueFont);
        addInfoCell(table, "Paid Days", payslip.getPaidDays().toPlainString(), labelFont, valueFont);
        return table;
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + ": ", labelFont));
        p.add(new Chunk(value, valueFont));
        PdfPCell cell = new PdfPCell(p);
        cell.setBorder(0);
        cell.setPaddingBottom(4f);
        table.addCell(cell);
    }

    private PdfPTable amountTable(Font headerFont) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 1});

        PdfPCell componentHeader = new PdfPCell(new Paragraph("Component", headerFont));
        componentHeader.setBackgroundColor(TABLE_HEADER_BG);
        componentHeader.setBorderColor(BORDER_COLOR);
        componentHeader.setPadding(5f);

        PdfPCell amountHeader = new PdfPCell(new Paragraph("Amount", headerFont));
        amountHeader.setBackgroundColor(TABLE_HEADER_BG);
        amountHeader.setBorderColor(BORDER_COLOR);
        amountHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
        amountHeader.setPadding(5f);

        table.addCell(componentHeader);
        table.addCell(amountHeader);
        return table;
    }

    private void addRow(PdfPTable table, String label, BigDecimal amount, Font font, boolean shaded) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, font));
        labelCell.setBorderColor(BORDER_COLOR);
        labelCell.setPadding(5f);

        PdfPCell amountCell = new PdfPCell(new Paragraph(formatAmount(amount), font));
        amountCell.setBorderColor(BORDER_COLOR);
        amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        amountCell.setPadding(5f);

        if (shaded) {
            labelCell.setBackgroundColor(ROW_ALT_BG);
            amountCell.setBackgroundColor(ROW_ALT_BG);
        }

        table.addCell(labelCell);
        table.addCell(amountCell);
    }

    private void addTotalRow(PdfPTable table, String label, BigDecimal amount, Font font) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, font));
        labelCell.setBorderColor(BORDER_COLOR);
        labelCell.setBackgroundColor(TABLE_HEADER_BG);
        labelCell.setPadding(5f);

        PdfPCell amountCell = new PdfPCell(new Paragraph(formatAmount(amount), font));
        amountCell.setBorderColor(BORDER_COLOR);
        amountCell.setBackgroundColor(TABLE_HEADER_BG);
        amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        amountCell.setPadding(5f);

        table.addCell(labelCell);
        table.addCell(amountCell);
    }

    private PdfPTable netPayStrip(BigDecimal netPay, Font labelFont, Font valueFont) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 1});

        PdfPCell labelCell = new PdfPCell(new Paragraph("NET PAY", labelFont));
        labelCell.setBackgroundColor(NET_PAY_BG);
        labelCell.setBorderColor(BORDER_COLOR);
        labelCell.setPadding(8f);
        labelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        PdfPCell valueCell = new PdfPCell(new Paragraph(formatAmount(netPay), valueFont));
        valueCell.setBackgroundColor(NET_PAY_BG);
        valueCell.setBorderColor(BORDER_COLOR);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        valueCell.setPadding(8f);

        table.addCell(labelCell);
        table.addCell(valueCell);
        return table;
    }

    private com.lowagie.text.pdf.draw.LineSeparator ruleBelow() {
        com.lowagie.text.pdf.draw.LineSeparator line = new com.lowagie.text.pdf.draw.LineSeparator();
        line.setLineColor(RULE_COLOR);
        line.setLineWidth(1f);
        return line;
    }

    private Paragraph spacer(float heightPt) {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(0f);
        p.setLeading(heightPt);
        return p;
    }

    /** Indian digit grouping (e.g. ₹ 3,79,200.00) rather than plain toPlainString(). */
    private String formatAmount(BigDecimal amount) {
        DecimalFormat format = new DecimalFormat("#,##,##0.00");
        return "\u20B9 " + format.format(amount);
    }
}