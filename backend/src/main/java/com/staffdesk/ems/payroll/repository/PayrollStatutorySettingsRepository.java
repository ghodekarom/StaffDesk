package com.staffdesk.ems.payroll.repository;

import com.staffdesk.ems.payroll.entity.PayrollStatutorySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface PayrollStatutorySettingsRepository extends JpaRepository<PayrollStatutorySettings, Long> {

    /**
     * Resolves the single settings row whose effective_from/effective_to range covers
     * the given date — a payroll run always uses the row valid for its period, so
     * historical payslips stay correct even after rates change (§4.3).
     */
    @Query("""
            SELECT s FROM PayrollStatutorySettings s
            WHERE s.effectiveFrom <= :date
              AND (s.effectiveTo IS NULL OR s.effectiveTo >= :date)
            """)
    Optional<PayrollStatutorySettings> findApplicableSettings(@Param("date") LocalDate date);
}
