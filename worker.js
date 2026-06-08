import redisCli from "./red-conn.js";
import { setTimeout } from "timers/promises";
import sendMail from "./nodemailer.js";

while (true) {
    const numOfEmails = await redisCli.LLEN("eq");
    if (numOfEmails === 0) {
        console.log("Sleep mode activated");

        await setTimeout(5000);
        console.log("Sleep mode ended");

        continue;
    }

    const firstEmail = await redisCli.LPOP("eq");

    const { to, subject, msg } = JSON.parse(firstEmail);

    await sendMail(to, subject, msg);

    console.log(`Email sent to: ${to}`);

}