# 📧 Simple Email Worker — Node.js

A lightweight, Redis-backed email queue system built with raw Node.js and Nodemailer. No BullMQ. No bull. Just a producer, a queue, and a worker.

## How It Works

A client sends a POST request to the Express server, which pushes the email job to a Redis list called "eq" using RPUSH. A background worker runs an infinite loop, pops emails from the same list using LPOP (FIFO order), and sends them one-by-one through Gmail SMTP via Nodemailer. The worker sleeps for 5 seconds when the queue is empty and wakes up to check again.

## Prerequisites

You need Node.js 18+, npm 9+, and Redis 6+ installed on your machine. Check with `node -v`, `npm -v`, and `redis-cli ping`. If `redis-cli ping` returns `PONG`, Redis is running. To install Redis: on macOS use `brew install redis && brew services start redis`, on Linux use `sudo apt update && sudo apt install redis && sudo systemctl start redis`, on Windows use WSL then follow the Linux instructions.

## Installation

Clone the repository with `git clone https://github.com/mdahanaf/simple-email-worker-node-js.git` then navigate into it with `cd simple-email-worker-node-js`. Install all dependencies with `npm install`.

Now you need a Gmail App Password. You cannot use your regular Gmail password — Google blocks third-party apps from using it. Go to https://myaccount.google.com/, click Security in the left sidebar, and enable 2-Step Verification if it's not already on. Once 2FA is active, go back to the Security page and click "App passwords." At the bottom, select "Mail" as the app, choose "Other (Custom name)" as the device, type "Node Email Worker," and click Generate. Google will show a 16-character password in a yellow box — copy it and remove all spaces so it becomes one continuous string like `abcdefghijklmnop`.

Create your `.env` file by copying the example: `cp .env.example .env`. Open it and add your Gmail address and that 16-character App Password like this: `USER_GMAIL="yourname@gmail.com"` and `USER_PASS="abcdefghijklmnop"`. Never commit `.env` to Git — it's already in `.gitignore`.

Edit `emails.js` with the recipient addresses you want to send to. You can use real Gmail addresses, Outlook addresses, or for testing use YOPmail (https://yopmail.com) which requires no signup — just make up any address ending in `@yopmail.com` and you can check incoming emails on their website.

## Running the Project

Open two terminal windows. In the first, run `npm run dev` to start the Express API server on port 3000. In the second, run `node worker.js` to start the background worker. The worker will show "Sleep mode activated" when the queue is empty and wakes up every 5 seconds.

## Sending Emails

Send a POST request to `http://localhost:3000/` with a JSON body containing a subject and message. Using curl: `curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"subject": "25% Discount from Apple", "msg": "Get 25% off on all MacBooks. Offer valid from 18th to 28th July, 2026."}'`. Using Postman or Insomnia, set the method to POST, URL to `http://localhost:3000/`, body type to raw JSON, and paste the same JSON. The API will respond with a success message, and in the worker terminal you'll see each email being sent one after another.

## Project Files

The project has a clean structure: `index.js` is the Express server that receives email jobs, `worker.js` is the infinite loop that consumes and sends emails, `nodemailer.js` configures the Gmail SMTP transporter, `red-conn.js` handles the Redis connection, `emails.js` holds the list of recipient addresses, `.env` stores your credentials (git-ignored), `.env.example` is the template, and `package.json` manages dependencies.

## Inspecting the Queue

While the system is running, open `redis-cli` and use commands like `LLEN eq` to see how many emails are waiting, `LRANGE eq 0 -1` to view all queued emails without removing them, `LINDEX eq 0` to peek at the first email, or `DEL eq` to clear the entire queue.

## Troubleshooting

If you get a Redis Client Error, Redis isn't running — start it with `sudo service redis-server start` on Linux or `brew services start redis` on macOS. If Gmail says "Username and Password not accepted," you're using your regular password instead of an App Password — regenerate one from your Google Account settings. If port 3000 is already in use, change it in `index.js` to something else like 3001. If the worker stays in sleep mode, the queue is empty — send a POST request to populate it. If emails land in spam, that's normal for new Gmail accounts sending bulk — warm up slowly or use YOPmail for testing.

## Gmail Limits

Free Gmail accounts can send roughly 500 emails per day with a safe rate of about one email every 1-2 seconds. New accounts sending bulk too quickly may get flagged, so for development and testing stick to YOPmail or Mailtrap.

## Future Ideas

Add retry logic for failed emails with a max attempt counter, create a dead letter queue that writes permanent failures to a fail.txt file, make the delay between sends configurable, handle graceful shutdown on Ctrl+C so in-flight emails aren't lost, support HTML emails and attachments, build a simple web dashboard to monitor the queue, or containerize everything with Docker.

## License

MIT — free to use, modify, and share.

Built with raw Node.js. Redis as the queue. Nodemailer as the messenger. No frameworks, no magic.
