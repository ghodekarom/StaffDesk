package com.staffdesk.ems.payroll.repository;

import com.staffdesk.ems.payroll.entity.TdsSlab;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TdsSlabRepository extends JpaRepository<TdsSlab, Long> {

    /** Ordered by slab_order so callers can feed the result straight into TdsCalculator. */
    List<TdsSlab> findByFinancialYearOrderBySlabOrderAsc(String financialYear);
}
