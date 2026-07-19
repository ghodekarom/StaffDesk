package com.staffdesk.ems.employee.service;

import com.staffdesk.ems.common.exception.DuplicateResourceException;
import com.staffdesk.ems.common.exception.ResourceNotFoundException;
import com.staffdesk.ems.department.repository.DepartmentRepository;
import com.staffdesk.ems.employee.dto.EmployeeRequestDto;
import com.staffdesk.ems.employee.dto.EmployeeResponseDto;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private EmployeeRequestDto validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new EmployeeRequestDto(
                "EMP-001",
                "Ada",
                "Lovelace",
                "ada@staffdesk.com",
                "1234567890",
                null,
                null,
                "Software Engineer",
                LocalDate.of(2024, 1, 15)
        );
    }

    @Test
    void create_savesEmployee_whenEmailAndCodeAreUnique() {
        when(employeeRepository.existsByEmail(validRequest.email())).thenReturn(false);
        when(employeeRepository.existsByEmployeeCode(validRequest.employeeCode())).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee e = invocation.getArgument(0);
            e.setId(1L);
            return e;
        });

        EmployeeResponseDto result = employeeService.create(validRequest);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.email()).isEqualTo("ada@staffdesk.com");
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void create_throwsDuplicateResourceException_whenEmailAlreadyExists() {
        when(employeeRepository.existsByEmail(validRequest.email())).thenReturn(true);

        assertThatThrownBy(() -> employeeService.create(validRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(validRequest.email());

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void getById_throwsResourceNotFoundException_whenEmployeeDoesNotExist() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}
