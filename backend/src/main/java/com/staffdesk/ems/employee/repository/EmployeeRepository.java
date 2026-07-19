package com.staffdesk.ems.employee.repository;

import com.staffdesk.ems.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    // For an eventual "am I updating myself and keeping the same email" check
    boolean existsByEmailAndIdNot(String email, Long id);
}
