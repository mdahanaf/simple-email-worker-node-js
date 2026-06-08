# 📧 Simple Email Worker — Node.js

A lightweight, Redis-backed email queue system built with raw Node.js and Nodemailer. No BullMQ. No bull. Just a producer, a queue, and a worker.

---

## How It Works

A client sends a `POST` request to the Express server, which pushes the email job to a Redis list called `"eq"` using `RPUSH`. A background worker runs an infinite loop, pops emails from the same list using `LPOP` (FIFO order), and sends them one-by-one through Gmail SMTP via Nodemailer. The worker sleeps for 5 seconds when the queue is empty and wakes up to check again.

---

## Prerequisites

You need **Node.js 18+**, **npm 9+**, and **Redis 6+** installed. Verify with:

```bash
node -v
npm -v
redis-cli ping   # Should return PONG
```

**Install Redis:**

```bash
# macOS
brew install redis && brew services start redis

# Linux
sudo apt update && sudo apt install redis && sudo systemctl start redis

# Windows — use WSL, then follow the Linux instructions above
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/mdahanaf/simple-email-worker-node-js.git
cd simple-email-worker-node-js
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate a Gmail App Password

> ⚠️ You **cannot** use your regular Gmail password — Google blocks third-party apps from using it.

1. Go to [https://myaccount.google.com/](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification** if not already on
4. Go back to Security → click **App passwords**
5. Select **Mail** as the app, **Other (Custom name)** as the device
6. Type `Node Email Worker` → click **Generate**
7. Copy the 16-character password shown and **remove all spaces**:
   ```
   abcdefghijklmnop
   ```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
USER_GMAIL="yourname@gmail.com"
USER_PASS="abcdefghijklmnop"
```

> 🔒 Never commit `.env` to Git — it's already in `.gitignore`.

### 5. Set recipient addresses

Edit `emails.js` with the addresses you want to send to.

> 💡 For testing, use [YOPmail](https://yopmail.com) — no signup needed. Make up any address ending in `@yopmail.com` and check incoming mail on their website.

---

## Running the Project

Open **two terminal windows**:

**Terminal 1 — Start the API server:**

```bash
npm run dev
```

**Terminal 2 — Start the background worker:**

```bash
node worker.js
```

> The worker prints `Sleep mode activated` when the queue is empty and wakes up every 5 seconds.

---

## Sending Emails

Send a `POST` request to `http://localhost:3000/` with a JSON body containing `subject` and `msg`.

**Using curl:**

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"subject": "25% Discount from Apple", "msg": "Get 25% off on all MacBooks. Offer valid from 18th to 28th July, 2026."}'
```

**Using Postman / Insomnia:**

| Field       | Value                        |
|-------------|------------------------------|
| Method      | `POST`                       |
| URL         | `http://localhost:3000/`     |
| Body type   | `raw` → `JSON`               |

```json
{
  "subject": "25% Discount from Apple",
  "msg": "Get 25% off on all MacBooks. Offer valid from 18th to 28th July, 2026."
}
```

The API responds with a success message. In the worker terminal you'll see each email being sent one after another.

---

## Project Structure

```
simple-email-worker-node-js/
├── index.js          # Express server — receives email jobs
├── worker.js         # Infinite loop — consumes and sends emails
├── nodemailer.js     # Gmail SMTP transporter config
├── red-conn.js       # Redis connection
├── emails.js         # List of recipient addresses
├── .env              # Your credentials (git-ignored)
├── .env.example      # Template for .env
└── package.json      # Dependencies
```

---

## Inspecting the Queue

While the system is running, open `redis-cli` and use:

```bash
LLEN eq              # Number of emails waiting
LRANGE eq 0 -1       # View all queued emails (non-destructive)
LINDEX eq 0          # Peek at the first email
DEL eq               # Clear the entire queue
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Redis Client Error` | Redis isn't running. Start it: `sudo service redis-server start` (Linux) or `brew services start redis` (macOS) |
| `Username and Password not accepted` | You used your regular Gmail password. Regenerate an App Password from Google Account → Security |
| Port 3000 already in use | Change the port in `index.js` (e.g. `3001`) |
| Worker stays in sleep mode | Queue is empty — send a POST request to populate it |
| Emails land in spam | Normal for new Gmail accounts sending bulk. Use YOPmail or Mailtrap for testing |

---

## Gmail Limits

Free Gmail accounts can send roughly **500 emails/day** at a safe rate of about **1 email every 1–2 seconds**. New accounts sending bulk too quickly may get flagged — stick to YOPmail or Mailtrap for development.

---

## Future Ideas

- Retry logic for failed emails with a max attempt counter
- Dead letter queue that writes permanent failures to `fail.txt`
- Configurable delay between sends
- Graceful shutdown on `Ctrl+C` so in-flight emails aren't lost
- HTML emails and attachments support
- Simple web dashboard to monitor the queue
- Docker containerization

---

## License

MIT — free to use, modify, and share.

---

> Built with raw Node.js · Redis as the queue · Nodemailer as the messenger · No frameworks, no magic.
