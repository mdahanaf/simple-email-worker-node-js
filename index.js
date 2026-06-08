import redisCli from "./red-conn.js";
import express from "express";
import emails from "./emails.js";



const app = express();

app.use(express.json());



app.post("/", async (req, res) => {
    const { subject, msg } = req.body;

    for (let i = 0; i < emails.length; i++) {
        const data = {
            to: emails[i],
            subject, msg
        }

        await redisCli.RPUSH("eq", JSON.stringify(data));
    }




    return res.json({ Hello: "world", ...req.body, msg: "Successfully added to Redis." })
})

app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
    
})



