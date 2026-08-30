package com.staffdesk.ems.messaging.service;

import com.staffdesk.ems.common.exception.ResourceNotFoundException;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.messaging.dto.MessageResponse;
import com.staffdesk.ems.messaging.dto.SendMessageRequest;
import com.staffdesk.ems.messaging.entity.Message;
import com.staffdesk.ems.messaging.repository.MessageRepository;
import com.staffdesk.ems.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MessageService messageService;

    private Employee sender;
    private Employee recipient;

    @BeforeEach
    void setUp() {
        sender = new Employee();
        sender.setId(1L);
        sender.setFirstName("Ada");
        sender.setLastName("Lovelace");

        recipient = new Employee();
        recipient.setId(2L);
        recipient.setFirstName("Alan");
        recipient.setLastName("Turing");
    }

    @Test
    void send_savesMessage_andSendsNotification() {
        SendMessageRequest request = new SendMessageRequest(2L, "Hello Alan, let's sync on the compiler.");

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(employeeRepository.existsById(2L)).thenReturn(true);
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message m = invocation.getArgument(0);
            setField(m, "id", 10L);
            return m;
        });

        MessageResponse response = messageService.send(1L, request);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.senderEmployeeId()).isEqualTo(1L);
        assertThat(response.recipientEmployeeId()).isEqualTo(2L);
        verify(messageRepository).save(any(Message.class));
        verify(notificationService).notify(eq(2L), any(), contains("Ada Lovelace"), any(), any());
    }

    @Test
    void send_throwsIllegalArgumentException_whenSendingToSelf() {
        SendMessageRequest request = new SendMessageRequest(1L, "Talking to myself");

        assertThatThrownBy(() -> messageService.send(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("yourself");
        verify(messageRepository, never()).save(any());
    }

    @Test
    void send_throwsResourceNotFoundException_whenRecipientNotFound() {
        SendMessageRequest request = new SendMessageRequest(99L, "Hello");

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(employeeRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> messageService.send(1L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void loadThread_loadsMessages_andMarksThreadRead() {
        PageRequest pageable = PageRequest.of(0, 10);
        Message m = new Message();
        setField(m, "id", 10L);
        m.setSenderEmployeeId(2L);
        m.setRecipientEmployeeId(1L);
        m.setBody("Hey Ada");
        setField(m, "createdAt", Instant.now());

        when(messageRepository.findThread(1L, 2L, pageable))
                .thenReturn(new PageImpl<>(List.of(m)));

        Page<MessageResponse> page = messageService.loadThread(1L, 2L, pageable);

        assertThat(page.getContent()).hasSize(1);
        verify(messageRepository).markThreadRead(1L, 2L);
    }

    @Test
    void unreadCount_returnsUnreadMessagesForRecipient() {
        when(messageRepository.countByRecipientEmployeeIdAndReadFalse(1L)).thenReturn(3L);

        long count = messageService.unreadCount(1L);

        assertThat(count).isEqualTo(3L);
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
