package com.staffdesk.ems.department.service;

import java.util.Optional;

/**
 * Thin seam between the department module and your existing employee module.
 * Implement EmployeeLookupServiceImpl (in this same package) to delegate to
 * your actual EmployeeRepository/Employee entity — see the class for the
 * exact adjustment needed.
 */
public interface EmployeeLookupService {

    Optional<EmployeeSummary> findSummary(Long employeeId);

    long countByDepartmentId(Long departmentId);

    boolean existsAndActive(Long employeeId);

    record EmployeeSummary(Long id, String fullName) {}
}
