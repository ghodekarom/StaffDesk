package com.staffdesk.ems.payroll.repository;

import com.staffdesk.ems.payroll.entity.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {

    Optional<PayrollRun> findByPeriodMonthAndPeriodYear(Integer periodMonth, Integer periodYear);
}
