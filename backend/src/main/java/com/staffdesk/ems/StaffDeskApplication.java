package com.staffdesk.ems;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// EnableScheduling powers AttendanceReminderScheduler's daily @Scheduled job.
@SpringBootApplication
@EnableScheduling
public class  StaffDeskApplication {
    public static void main(String[] args) {
        SpringApplication.run(StaffDeskApplication.class, args);
    }
}