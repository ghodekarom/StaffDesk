package com.staffdesk.ems.department.service;

import com.staffdesk.ems.department.dto.DepartmentRequest;
import com.staffdesk.ems.department.dto.DepartmentResponse;
import com.staffdesk.ems.department.entity.Department;
import com.staffdesk.ems.department.repository.DepartmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeLookupService employeeLookupService;

    public DepartmentService(DepartmentRepository departmentRepository,
                              EmployeeLookupService employeeLookupService) {
        this.departmentRepository = departmentRepository;
        this.employeeLookupService = employeeLookupService;
    }

    @Transactional(readOnly = true)
    public Page<DepartmentResponse> list(Pageable pageable) {
        return departmentRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new DepartmentNotFoundException(id));
        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        String name = request.getName().trim();

        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateDepartmentNameException(name);
        }

        if (!employeeLookupService.existsAndActive(request.getHeadEmployeeId())) {
            throw new InvalidHeadEmployeeException(request.getHeadEmployeeId());
        }

        Department department = new Department();
        department.setName(name);
        department.setHeadEmployeeId(request.getHeadEmployeeId());

        Department saved = departmentRepository.save(department);
        return toResponse(saved);
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new DepartmentNotFoundException(id));

        String name = request.getName().trim();

        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateDepartmentNameException(name);
        }

        if (!employeeLookupService.existsAndActive(request.getHeadEmployeeId())) {
            throw new InvalidHeadEmployeeException(request.getHeadEmployeeId());
        }

        department.setName(name);
        department.setHeadEmployeeId(request.getHeadEmployeeId());

        Department saved = departmentRepository.save(department);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new DepartmentNotFoundException(id);
        }
        // Safe by design: employees.department_id is ON DELETE SET NULL in the schema,
        // so deleting a department un-assigns its employees rather than failing or cascading.
        departmentRepository.deleteById(id);
    }

    private DepartmentResponse toResponse(Department department) {
        String headName = employeeLookupService.findSummary(department.getHeadEmployeeId())
                .map(EmployeeLookupService.EmployeeSummary::fullName)
                .orElse(null);

        long employeeCount = employeeLookupService.countByDepartmentId(department.getId());

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getHeadEmployeeId(),
                headName,
                employeeCount,
                department.getCreatedAt(),
                department.getUpdatedAt()
        );
    }
}
