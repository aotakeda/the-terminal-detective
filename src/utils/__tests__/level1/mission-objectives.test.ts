import { describe, expect, it } from "vitest";
import { LEVEL1_MISSIONS } from "../../../data/missions-level1";
import { validateObjective } from "../../objectives";

describe("Mission Objectives Validation - Level 1", () => {
	describe("Mission 01 - The Missing Files", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_01");
		if (!mission) throw new Error("Mission 01 not found");

		it("should complete list_contents objective when running ls", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "list_contents",
			);
			if (!objective) throw new Error("Objective list_contents not found");
			const result = validateObjective(
				objective,
				"ls",
				"",
				"evidence suspects",
			);
			expect(result).toBe(true);
		});

		it("should complete navigate_evidence objective when running cd evidence", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "navigate_evidence",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(objective, "cd", "evidence", "");
			expect(result).toBe(true);
		});

		it("should complete check_location objective when running pwd", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "check_location",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(objective, "pwd", "", "/evidence");
			expect(result).toBe(true);
		});

		it("should complete read_case_file objective when reading case_file.txt", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "read_case_file",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"cat",
				"case_file.txt",
				"Case #2024-001: Missing Financial Records",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 02 - The Hidden Clues", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_02");
		if (!mission) throw new Error("Mission 02 not found");

		it("should complete show_hidden_files objective when running ls -a", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "show_hidden_files",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ls",
				"-a",
				".hidden_evidence investigation_notes",
			);
			expect(result).toBe(true);
		});

		it("should complete detailed_listing objective when running ls -la", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "detailed_listing",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ls",
				"-la",
				"drwxr-xr-x Jan 15 12:00 .",
			);
			expect(result).toBe(true);
		});

		it("should complete read_hidden_file objective when reading hidden file", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "read_hidden_file",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"cat",
				".hidden_evidence",
				"CLASSIFIED EVIDENCE LOG",
			);
			expect(result).toBe(true);
		});

		it("should complete explore_hidden_directory objective when navigating to .backup", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "explore_hidden_directory",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(objective, "cd", ".backup", "");
			expect(result).toBe(true);
		});

		it("should complete find_recovered_files objective when listing backup contents", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "find_recovered_files",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ls",
				"",
				"quarterly_report.xlsx budget_2024.pdf expense_records.csv",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 03 - The Search Operation", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_03");
		if (!mission) throw new Error("Mission 03 not found");

		it("should complete find_by_name objective when finding evidence files", () => {
			const objective = mission.objectives.find((o) => o.id === "find_by_name");
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"find",
				"-name *evidence*",
				"./documents/secret_evidence.txt",
			);
			expect(result).toBe(true);
		});

		it("should complete find_by_type objective when finding txt files", () => {
			const objective = mission.objectives.find((o) => o.id === "find_by_type");
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"find",
				"-name *.txt",
				"./documents/report.txt ./logs/access.log",
			);
			expect(result).toBe(true);
		});

		it("should complete search_content_password objective when grepping for password", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "search_content_password",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"grep",
				"-r password",
				"./documents/secret_evidence.txt:Password compromise suspected: admin123",
			);
			expect(result).toBe(true);
		});

		it("should complete search_content_case_insensitive objective when grepping confidential", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "search_content_case_insensitive",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"grep",
				"-ri confidential",
				"./documents/report.txt:This document contains confidential information",
			);
			expect(result).toBe(true);
		});

		it("should complete count_matches objective when counting suspect occurrences", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "count_matches",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"grep",
				"-rc suspect",
				"./investigation/suspect_profile.txt:3",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 04 - The File Detective", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_04");
		if (!mission) throw new Error("Mission 04 not found");

		it("should complete examine_file_start objective when using head", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "examine_file_start",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"head",
				"server_log.txt",
				"SERVER START - January 16, 2024 00:00:01",
			);
			expect(result).toBe(true);
		});

		it("should complete examine_file_end objective when using tail", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "examine_file_end",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"tail",
				"server_log.txt",
				"02:35:45 - CRITICAL ALERT: Security breach confirmed",
			);
			expect(result).toBe(true);
		});

		it("should complete count_file_contents objective when using wc", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "count_file_contents",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"wc",
				"evidence.txt",
				"23 178 1247 evidence.txt",
			);
			expect(result).toBe(true);
		});

		it("should complete identify_file_type objective when using file command", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "identify_file_type",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"file",
				"suspicious_file",
				"suspicious_file: executable",
			);
			expect(result).toBe(true);
		});

		it("should complete examine_specific_lines objective with piped command", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "examine_specific_lines",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"head",
				"head -20 investigation_notes.txt | tail -6",
				"Day 15: BREAKTHROUGH - Suspect identified",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 05 - The Permission Problem", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_05");
		if (!mission) throw new Error("Mission 05 not found");

		it("should complete examine_permissions objective when using ls -l", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "examine_permissions",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ls",
				"-l",
				"-rwxrwxrwx 1 user user 1247 Jan 15 12:00 secret.txt",
			);
			expect(result).toBe(true);
		});

		it("should complete secure_secret_file objective when using chmod 644", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "secure_secret_file",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"chmod",
				"644 secret.txt",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete make_script_executable objective when using chmod +x", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "make_script_executable",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"chmod",
				"+x security_check.sh",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete verify_changes objective when checking permissions", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "verify_changes",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ls",
				"-l",
				"-rw-r--r-- 1 user user 1247 Jan 15 12:00 secret.txt -rwxr-xr-x 1 user user 856 Jan 15 12:00 security_check.sh",
			);
			expect(result).toBe(true);
		});

		it("should complete find_unsafe_permissions objective when finding world-writable files", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "find_unsafe_permissions",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"find",
				"-perm -002",
				"./security/vulnerable.txt",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 06 - The Directory Detective", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_06");
		if (!mission) throw new Error("Mission 06 not found");

		it("should complete create_case_structure objective when creating directory", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "create_case_structure",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(objective, "mkdir", "case_2024_004", "");
			expect(result).toBe(true);
		});

		it("should complete copy_evidence objective when copying file", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "copy_evidence",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"cp",
				"important_evidence.txt case_2024_004/",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete rename_file objective when moving/renaming file", () => {
			const objective = mission.objectives.find((o) => o.id === "rename_file");
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"mv",
				"case_2024_004/important_evidence.txt case_2024_004/primary_evidence.txt",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete create_subdirectories objective when creating multiple dirs", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "create_subdirectories",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"mkdir",
				"case_2024_004/witnesses case_2024_004/forensics case_2024_004/timeline",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete organize_files objective when moving witness statement", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "organize_files",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"mv",
				"witness_statement.txt case_2024_004/witnesses/",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete verify_organization objective when listing case directory", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "verify_organization",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ls",
				"case_2024_004",
				"primary_evidence.txt witnesses forensics timeline",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 07 - The Archive Explorer", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_07");
		if (!mission) throw new Error("Mission 07 not found");

		it("should complete list_archive_contents objective when using tar -tf", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "list_archive_contents",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"tar",
				"-tf suspicious_archive.tar",
				"hidden_data.txt financial_records/",
			);
			expect(result).toBe(true);
		});

		it("should complete extract_archive objective when using tar -xf", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "extract_archive",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"tar",
				"-xf suspicious_archive.tar",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete decompress_gzip objective when using gunzip", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "decompress_gzip",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"gunzip",
				"encrypted_data.gz",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete create_evidence_archive objective when creating tar", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "create_evidence_archive",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"tar",
				"-cf evidence_collection.tar hidden_data.txt financial_records/",
				"",
			);
			expect(result).toBe(true);
		});

		it("should complete compress_evidence objective when using gzip", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "compress_evidence",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"gzip",
				"evidence_collection.tar",
				"",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 08 - The System Inspector", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_08");
		if (!mission) throw new Error("Mission 08 not found");

		it("should complete list_processes objective when using ps aux", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "list_processes",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ps",
				"aux",
				"crypto_miner 1337 95.2 data_harvester 2456 15.8",
			);
			expect(result).toBe(true);
		});

		it("should complete monitor_resources objective when using top", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "monitor_resources",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"top",
				"",
				"CPU usage: 115.4% Memory usage: 7.2GB/8GB",
			);
			expect(result).toBe(true);
		});

		it("should complete check_disk_space objective when using df -h", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "check_disk_space",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"df",
				"-h",
				"/dev/sda1 60G 51G 6.8G 85% / CRITICAL: Disk space above threshold",
			);
			expect(result).toBe(true);
		});

		it("should complete find_large_files objective when using du -sh", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "find_large_files",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"du",
				"-sh suspicious_data",
				"15G suspicious_data/",
			);
			expect(result).toBe(true);
		});

		it("should complete investigate_process objective when filtering processes", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "investigate_process",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ps",
				"aux | grep crypto_miner",
				"user 1337 95.2% 2.1 crypto_miner --pool=malicious.pool.com",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 09 - The Process Manager", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_09");
		if (!mission) throw new Error("Mission 09 not found");

		it("should complete kill_crypto_miner objective when killing process", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "kill_crypto_miner",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"kill",
				"1337",
				"Process 1337 crypto_miner terminated successfully",
			);
			expect(result).toBe(true);
		});

		it("should complete killall_harvesters objective when using killall", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "killall_harvesters",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"killall",
				"data_harvester",
				"3 data_harvester processes terminated",
			);
			expect(result).toBe(true);
		});

		it("should complete force_kill_keylogger objective when using kill -9", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "force_kill_keylogger",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"kill",
				"-9 3789",
				"Process 3789 keylogger_daemon terminated (forced)",
			);
			expect(result).toBe(true);
		});

		it("should complete locate_malware objective when using which", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "locate_malware",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"which",
				"crypto_miner",
				"/tmp/.hidden/crypto_miner",
			);
			expect(result).toBe(true);
		});

		it("should complete check_command_type objective when using type", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "check_command_type",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"type",
				"data_harvester",
				"data_harvester is /tmp/.malware/data_harvester",
			);
			expect(result).toBe(true);
		});

		it("should complete verify_cleanup objective when checking for remaining processes", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "verify_cleanup",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ps",
				"aux | grep -E 'crypto_miner|data_harvester|keylogger'",
				"No malicious processes found - system clean",
			);
			expect(result).toBe(true);
		});
	});

	describe("Mission 10 - The Network Operator", () => {
		const mission = LEVEL1_MISSIONS.find((m) => m.id === "mission_10");
		if (!mission) throw new Error("Mission 10 not found");

		it("should complete test_connectivity objective when using ping", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "test_connectivity",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"ping",
				"-c 4 malicious-server.example.com",
				"4 packets transmitted, 4 received, 0% packet loss",
			);
			expect(result).toBe(true);
		});

		it("should complete download_evidence objective when using wget", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "download_evidence",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"wget",
				"http://evidence-server.local/malware_sample.txt",
				"malware_sample.txt saved [2847/2847]",
			);
			expect(result).toBe(true);
		});

		it("should complete test_api_endpoint objective when using curl", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "test_api_endpoint",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"curl",
				"http://suspicious-api.local/status",
				'{"status": "active", "connections": 47}',
			);
			expect(result).toBe(true);
		});

		it("should complete check_connections objective when using netstat", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "check_connections",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"netstat",
				"-tuln",
				"tcp 0 0 0.0.0.0:31337 0.0.0.0:* LISTEN suspicious port detected",
			);
			expect(result).toBe(true);
		});

		it("should complete dns_lookup objective when using nslookup", () => {
			const objective = mission.objectives.find((o) => o.id === "dns_lookup");
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"nslookup",
				"malicious-server.example.com",
				"Address: 203.0.113.666",
			);
			expect(result).toBe(true);
		});

		it("should complete sync_investigation objective when using rsync", () => {
			const objective = mission.objectives.find(
				(o) => o.id === "sync_investigation",
			);
			if (!objective) throw new Error("Objective not found");
			const result = validateObjective(
				objective,
				"rsync",
				"-av investigation_files/ backup-server:/cases/",
				"sent 15,847 bytes received 523 bytes - 47 files transferred",
			);
			expect(result).toBe(true);
		});
	});
});
