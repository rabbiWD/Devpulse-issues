import fs from "fs";
const logger = (req, res, next) => {
    console.log("Method - URL - Time:", req.method, req.url, Date.now());
    const log = `Method -> ${req.method} | URL -> ${req.url} | Time -> ${new Date().toISOString()}\n`;
    fs.appendFile("logger.txt", log, (err) => {
        if (err) {
            console.error("Error writing to log file:", err);
        }
    });
    next();
};
export default logger;
//# sourceMappingURL=logger.js.map