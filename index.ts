import { connect, reset, restart, addresses } from "./connect"
import path from "path"
import readline from "readline"
import { Elysia } from "elysia"
import chalk from "chalk"
import { parseArgs } from "node:util"

const cooldowns = { r: 0, a: 0 }

try {
	const args = parseArgs({
		args: process.argv,
		options: {
			studio_path: {
				type: "string",
				short: "s"
			},
			project_path: {
				type: "string",
				short: "p"
			}
		},
		stict: false,
		allowPositionals: true
	})

	if (!args.values.project_path || !args.values.studio_path) {
		console.log(chalk.redBright("[ERROR]") + chalk.gray(" invalid aguments"))
		process.exit()
	}
	
    //@ts-ignore
	process.chdir(path.join(process.cwd(), args.values.project_path))

	//@ts-ignore
	connect(args.values.studio_path)

    console.log()
    console.log(chalk.blueBright("[STUDIO START]"))
    console.log(chalk.whiteBright("made by mqix"))
    console.log()
    console.log(chalk.magentaBright("a         ") + chalk.gray("to show addresses"));
    console.log(chalk.magentaBright("r         ") + chalk.gray("reload"));
    console.log(chalk.magentaBright("ctrl + r  ") + chalk.gray("reset"));
    console.log(chalk.magentaBright("ctrl + c  ") + chalk.gray("to escape"));
    console.log()

	readline.emitKeypressEvents(process.stdin)
	
    process.stdin.setRawMode(true)
	
    process.stdin.on("keypress", (_, key) => {
		switch (key.sequence) {
			// ctrl c
			case "\u0003": {
				process.exit()
			}

			// ctrl r
			case "\u0012": {
				if (Date.now() < cooldowns.r) return
				reset()
				cooldowns.r = Date.now() + 1000
				break
			}

			case "r": {
				if (Date.now() < cooldowns.r) return
				restart()
				cooldowns.r = Date.now() + 1000
				break
			}
			case "a": {
				if (Date.now() < cooldowns.a) return
				addresses.print()
				cooldowns.a = Date.now() + 500
				break
			}
		}
	})

	const server = new Elysia()
		.get("/reset", () => {
			reset()
			return new Response(null, { status: 204 })
		})
		.get("/restart", () => {
			restart()
			return new Response(null, { status: 204 })
		})
		.get("/addresses", () => {
			return addresses
		})

	server.listen(3025)
} catch (error) {
	console.log(chalk.redBright("[ERROR]") + "an unkown error has occured")
}
