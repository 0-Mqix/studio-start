import { spawn } from 'node:child_process';
import chalk from "chalk"
import readline from "readline"

const ignore = [
	"? >>",
	"❌ Failed to retrieve logs.",
	"[ERROR] Not Found (404) error.",
	"Retrieving logs...",
	"❌ No logs found.",
	"[ERROR] Internal Server Error (500) error.",
    "The Server IPs are unchanged. Enter 'info' to print the IPs",
    "The new server address is listed below.",
    "Server IP Addresses-------------------------------------",
    "--------------------------------------------------------",
]

const addressRegex = /Edition:\s+(.+)/

function getAdress(line: string) {
	const match = addressRegex.exec(line)
	return !match ? "" : match[1]
}

var logs = false
let command = ""

export const addresses = {
	java: "",
	bedrock: "",
	print: () => {
		console.log(chalk.blueBright("[ADDRESSES]"))
		console.log(chalk.grey("java    ") + chalk.whiteBright(addresses.java))
		console.log(chalk.gray("bedrock ") + chalk.whiteBright(addresses.bedrock))
		console.log()
	}
}

export const restart = () => {
    console.log(chalk.blueBright("[RESTART]\n"))
	command = "restart"
	logs = false
}

export function reset() {
	console.log(chalk.blueBright("[RESET]\n"))
	command = "reset"
	logs = false
}

function processLine(line: string) {
	if (line.includes("✅ Restarted Container!")) {
		console.log(chalk.greenBright("[CONTAINER]") + " restart done\n")
		logs = true
		return
	}

    if (line.includes("✅ Reset Development Container Successfully!")) {
		console.log(chalk.greenBright("[CONTAINER]") + " reset done\n")
		logs = true
        return
    }

	if (line.includes("Type a command, and press enter.")) {
		logs = true
		console.log(chalk.blueBright("[LOGS]") + " polling started\n")
		return
	}

	if (line.includes("Java Edition:")) {
		addresses.java = getAdress(line)
		return
	}

	if (line.includes("Bedrock Edition:")) {
		addresses.bedrock = getAdress(line)
		addresses.print()
		return
	}

	if (line.includes("✅ Started Game!")) {
		console.log(chalk.greenBright("[GAME]") + " started\n")
		return
	}

    for (const element of ignore) { if (line.includes(element)) return; }

	if (logs) {
		if (line.length == 0) return
		console.log(line)
		return
	}
}

const promt = Buffer.from([63, 32, 62, 62, 27, 91, 55, 71])

function bufferEndsWithPromt(source: Buffer) {
    if (promt.length > promt.length) return false;
    
    for (let i = 0; i < promt.length; i++) {
       if (source[source.length - promt.length + i] != promt[i]) return false
    }
    
    return true
}

export async function connect(studioPath: string) {
    try {
        const _process = spawn(studioPath, ['start']);
        const cli = readline.createInterface({input: _process.stdout, output: _process.stdin})
        _process.stdout.on("data", chunk => {

            if(bufferEndsWithPromt(chunk)) {
                setTimeout(() => {
                    if (command != "") {
                        cli.setPrompt(command + "\n");
                        cli.prompt();
                        command = ""
                    } else {
                        cli.setPrompt("l\n");
                        cli.prompt();
                    }
                }, 500)
            }
        }) 

        cli.on("line", processLine)

    } catch (error) {
	    console.log(chalk.redBright("[ERROR]") +  "an unkown error has occured")
    }
}
