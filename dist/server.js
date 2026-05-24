import app from "./app";
import config from "./config";
import { initDB } from "./db";
const port = config.port;
const main = async () => {
    initDB();
    // console.log(config.database_url)
    app.listen(port, () => {
        console.log(`server is running at port ${port}`);
    });
};
main();
//# sourceMappingURL=server.js.map