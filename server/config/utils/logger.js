const Logger = require('@ptkdev/logger')

const logger = new Logger({
    language: "en",
	colors: true,
	debug: true,
	info: true,
	warning: true,
	error: true,
	sponsor: true,
	write: true,
	type: "log",
	rotate: {
		size: "10M",
		encoding: "utf8",
	},
	path: {
		debug_log: "./logs/debug.json",
		error_log: "./logs/error.json",
	}
});

module.exports = logger;