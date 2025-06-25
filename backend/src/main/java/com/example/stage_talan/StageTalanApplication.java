package com.example.stage_talan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StageTalanApplication {

	public static void main(String[] args) {
		SpringApplication.run(StageTalanApplication.class, args);
	}

}
