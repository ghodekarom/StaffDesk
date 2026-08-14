package com.staffdesk.ems.employee.repository;

import com.staffdesk.ems.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Used by AttendanceReminderScheduler — only currently-working employees
    // should be nudged to clock in, not inactive/terminated ones.
    List<Employee> findByStatus(Employee.EmployeeStatus status);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmailAndIdNot(String email, Long id);

    long countByDepartmentId(Long departmentId);

    Page<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeCodeContainingIgnoreCase(
            String firstName, String lastName, String employeeCode, Pageable pageable);
}