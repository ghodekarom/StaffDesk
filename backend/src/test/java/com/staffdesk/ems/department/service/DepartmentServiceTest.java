package com.staffdesk.ems.department.service;

import com.staffdesk.ems.department.dto.DepartmentRequest;
import com.staffdesk.ems.department.dto.DepartmentResponse;
import com.staffdesk.ems.department.entity.Department;
import com.staffdesk.ems.department.repository.DepartmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private EmployeeLookupService employeeLookupService;

    @InjectMocks
    private DepartmentService departmentService;

    private Department department;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setId(1L);
        department.setName("Engineering");
        department.setHeadEmployeeId(10L);
    }

    @Test
    void list_returnsPagedDepartments() {
        PageRequest pageRequest = PageRequest.of(0, 10);
        when(departmentRepository.findAll(pageRequest)).thenReturn(new PageImpl<>(List.of(department)));
        when(employeeLookupService.findSummary(10L))
                .thenReturn(Optional.of(new EmployeeLookupService.EmployeeSummary(10L, "Ada Lovelace")));
        when(employeeLookupService.countByDepartmentId(1L)).thenReturn(5L);

        Page<DepartmentResponse> result = departmentService.list(pageRequest);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Engineering");
        assertThat(result.getContent().get(0).getHeadEmployeeName()).isEqualTo("Ada Lovelace");
        assertThat(result.getContent().get(0).getEmployeeCount()).isEqualTo(5L);
    }

    @Test
    void getById_returnsDepartment_whenFound() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(employeeLookupService.findSummary(10L))
                .thenReturn(Optional.of(new EmployeeLookupService.EmployeeSummary(10L, "Ada Lovelace")));
        when(employeeLookupService.countByDepartmentId(1L)).thenReturn(5L);

        DepartmentResponse result = departmentService.getById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Engineering");
    }

    @Test
    void getById_throwsException_whenNotFound() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.getById(99L))
                .isInstanceOf(DepartmentNotFoundException.class);
    }

    @Test
    void create_savesDepartment_whenValid() {
        DepartmentRequest request = new DepartmentRequest();
        request.setName("Design");
        request.setHeadEmployeeId(10L);

        when(departmentRepository.existsByNameIgnoreCase("Design")).thenReturn(false);
        when(employeeLookupService.existsAndActive(10L)).thenReturn(true);
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> {
            Department d = invocation.getArgument(0);
            d.setId(2L);
            return d;
        });

        DepartmentResponse result = departmentService.create(request);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getName()).isEqualTo("Design");
        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    void create_throwsDuplicateDepartmentNameException_whenNameExists() {
        DepartmentRequest request = new DepartmentRequest();
        request.setName("Engineering");

        when(departmentRepository.existsByNameIgnoreCase("Engineering")).thenReturn(true);

        assertThatThrownBy(() -> departmentService.create(request))
                .isInstanceOf(DuplicateDepartmentNameException.class);
        verify(departmentRepository, never()).save(any());
    }

    @Test
    void create_throwsInvalidHeadEmployeeException_whenHeadNotFoundOrInactive() {
        DepartmentRequest request = new DepartmentRequest();
        request.setName("Design");
        request.setHeadEmployeeId(99L);

        when(departmentRepository.existsByNameIgnoreCase("Design")).thenReturn(false);
        when(employeeLookupService.existsAndActive(99L)).thenReturn(false);

        assertThatThrownBy(() -> departmentService.create(request))
                .isInstanceOf(InvalidHeadEmployeeException.class);
        verify(departmentRepository, never()).save(any());
    }

    @Test
    void delete_removesDepartment_whenExists() {
        when(departmentRepository.existsById(1L)).thenReturn(true);

        departmentService.delete(1L);

        verify(departmentRepository).deleteById(1L);
    }

    @Test
    void delete_throwsException_whenNotFound() {
        when(departmentRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> departmentService.delete(99L))
                .isInstanceOf(DepartmentNotFoundException.class);
        verify(departmentRepository, never()).deleteById(any());
    }
}
