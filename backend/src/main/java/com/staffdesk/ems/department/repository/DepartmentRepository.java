package com.staffdesk.ems.department.repository;

import com.staffdesk.ems.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
