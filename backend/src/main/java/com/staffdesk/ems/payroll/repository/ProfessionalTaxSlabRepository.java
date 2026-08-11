package com.staffdesk.ems.payroll.repository;

import com.staffdesk.ems.payroll.entity.ProfessionalTaxSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProfessionalTaxSlabRepository extends JpaRepository<ProfessionalTaxSlab, Long> {

    /**
     * Slabs for one state, applicable on the given date, ordered ascending by band so
     * they can be fed straight into ProfessionalTaxCalculator (first match wins there).
     * Returns an empty list for a state with no seeded slabs — ProfessionalTaxCalculator
     * treats that as "doesn't levy PT" rather than an error.
     */
    @Query("""
            SELECT p FROM ProfessionalTaxSlab p
            WHERE p.state = :state
              AND p.effectiveFrom <= :date
              AND (p.effectiveTo IS NULL OR p.effectiveTo >= :date)
            ORDER BY p.fromAmount ASC
            """)
    List<ProfessionalTaxSlab> findApplicableSlabs(@Param("state") String state, @Param("date") LocalDate date);
}
