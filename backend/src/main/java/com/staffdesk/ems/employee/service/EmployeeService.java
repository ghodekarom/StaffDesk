package com.staffdesk.ems.employee.service;

import com.staffdesk.ems.employee.dto.EmployeeRequestDto;
import com.staffdesk.ems.employee.dto.EmployeeResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {

    EmployeeResponseDto create(EmployeeRequestDto request);

    EmployeeResponseDto getById(Long id);

    Page<EmployeeResponseDto> getAll(Pageable pageable);

    Page<EmployeeResponseDto> search(String search, Pageable pageable);

    EmployeeResponseDto update(Long id, EmployeeRequestDto request);

    void delete(Long id);
}