package com.staffdesk.ems.employee.repository;

import com.staffdesk.ems.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Used by AttendanceReminderScheduler — only currently-working employees
    // should be nudged to clock in, not inactive/terminated ones.
    List<Employee> findByStatus(Employee.EmployeeStatus status);

    long countByStatus(Employee.EmployeeStatus status);

    // "New hires this month" delta for the Overview KPI card.
    long countByStatusAndDateOfJoiningGreaterThanEqual(Employee.EmployeeStatus status, LocalDate since);

    // Department distribution chart — real headcount per department,
    // ACTIVE employees only, in one grouped query instead of N+1 counts.
    @Query("""
            SELECT e.department.name AS name, COUNT(e) AS total
            FROM Employee e
            WHERE e.status = com.staffdesk.ems.employee.entity.Employee.EmployeeStatus.ACTIVE
              AND e.department IS NOT NULL
            GROUP BY e.department.name
            ORDER BY COUNT(e) DESC
            """)
    List<DepartmentHeadcount> countActiveGroupedByDepartment();

    interface DepartmentHeadcount {
        String getName();
        long getTotal();
    }

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmailAndIdNot(String email, Long id);

    long countByDepartmentId(Long departmentId);

    Page<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeCodeContainingIgnoreCase(
            String firstName, String lastName, String employeeCode, Pageable pageable);

    // --- Issue #1: EMPLOYEE-role scoping for the directory endpoints ---
    // GET /employees/{id} for an EMPLOYEE caller: only resolves if the
    // target is in the caller's own department; otherwise behaves like a
    // 404, same as any other not-found id, rather than leaking that the
    // record exists in a different department.
    Optional<Employee> findByIdAndDepartmentId(Long id, Long departmentId);

    // GET /employees for an EMPLOYEE caller: same search behavior as
    // EmployeeService#search, just pre-filtered to one department instead
    // of company-wide.
    @Query("""
            SELECT e FROM Employee e
            WHERE e.department.id = :departmentId
              AND (:search IS NULL OR :search = ''
                   OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Employee> searchByDepartment(@Param("departmentId") Long departmentId,
                                      @Param("search") String search,
                                      Pageable pageable);
}