package com.staffdesk.ems.payroll.repository;

import com.staffdesk.ems.payroll.entity.SalaryStructure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {

    Optional<SalaryStructure> findByEmployeeIdAndEffectiveToIsNull(Long employeeId);

    Page<SalaryStructure> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId, Pageable pageable);
}
