import fs from 'fs';

class LoggerStream{
    write(message) {
        throw new Error("Method not implemented. Use a subclass.");
    }
}

class ConsoleLogger extends LoggerStream {
    write(message) {
        console.write(message);
    }
}

class FileLogger extends LoggerStream {
    constructor(filePath) {
        super();
        this.filePath = filePath;
        this.fs = fs;
    }
    write(message) {
        this.fs.appendFileSync(this.filePath, message + '\n', 'utf8');
    }
}

class NullLogger extends LoggerStream {
    write(message) {
        // Do nothing
    }
}

class Logger {
    constructor() {
        this.logger = new NullLogger('simulator.log'); // Change to ConsoleLogger() for console output
    }

    #treatMessage(message) {
        if (typeof message === 'object') {
            message =  JSON.stringify(message, null, 2);
        }
        if (typeof message === 'string' && message.charAt(message.length - 1) === '\n') {
            message = message.substring(0, message.length - 1);
        }
        if (this.addTimestamp) {
            const timestamp = new Date().toISOString();
            message = `[${timestamp}] ${message}`;
        }
        return message;
    }

    log(message) {
        message = this.#treatMessage(message);
        if (message) {
            this.logger.write(`> ${message}`);
        }
    }

    warn(message) {
        message = this.#treatMessage(message);
        this.logger.write(`[W] ${message}`);
    }
    error(message) {
        message = this.#treatMessage(message);
        this.logger.write(`[E] ${message}`);
    }

}

export const logger = new Logger();