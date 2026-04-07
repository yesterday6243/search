#!/usr/bin/env node

const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const Database = require("better-sqlite3");

const PASSWORD_MIN_LENGTH = 8;
const DEFAULT_DB_PATH = path.resolve(__dirname, "..", "searchindex.db");

function parseArgs(argv) {
  const options = {
    dbPath: DEFAULT_DB_PATH,
    username: "",
    password: "",
    listOnly: false,
    keepSessions: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--db" && argv[index + 1]) {
      options.dbPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (token === "--username" && argv[index + 1]) {
      options.username = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--password" && argv[index + 1]) {
      options.password = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--list") {
      options.listOnly = true;
      continue;
    }
    if (token === "--keep-sessions") {
      options.keepSessions = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage:
  node scripts/admin-reset-password.js --list
  node scripts/admin-reset-password.js --username <name> --password <new-password>

Options:
  --db <path>           SQLite database path. Default: ./searchindex.db
  --username <name>     Target username
  --password <value>    New password
  --list                List existing users
  --keep-sessions       Do not revoke existing sessions after reset
  -h, --help            Show help
`.trim());
}

function sanitizeUsername(value) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 32) {
    return "";
  }
  if (/\s/.test(trimmed)) {
    return "";
  }
  return trimmed;
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashBuffer = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return {
    algo: "scrypt-N16384-r8-p1-l64",
    saltHex: salt,
    hashHex: hashBuffer.toString("hex"),
  };
}

function prompt(question, { secret = false } = {}) {
  return new Promise((resolve) => {
    if (!secret) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    const originalWrite = rl._writeToOutput.bind(rl);
    rl._writeToOutput = function writeMaskedOutput(text) {
      if (rl.stdoutMuted) {
        rl.output.write("*");
        return;
      }
      originalWrite(text);
    };

    rl.stdoutMuted = true;
    rl.question(question, (answer) => {
      rl.stdoutMuted = false;
      rl.output.write("\n");
      rl.close();
      resolve(answer);
    });
  });
}

function listUsers(db) {
  const users = db
    .prepare(
      `
        SELECT id, username, created_at
        FROM users
        ORDER BY id ASC
      `
    )
    .all();

  if (!users.length) {
    console.log("No users found.");
    return;
  }

  for (const user of users) {
    console.log(`${user.id}\t${user.username}\t${user.created_at}`);
  }
}

async function resolveCredentials(options) {
  let username = options.username;
  let password = options.password;

  if (!username) {
    username = await prompt("Username: ");
  }
  if (!password) {
    password = await prompt("New password: ", { secret: true });
  }

  return { username, password };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = new Database(options.dbPath);

  try {
    if (options.listOnly) {
      listUsers(db);
      return;
    }

    const resolved = await resolveCredentials(options);
    const username = sanitizeUsername(resolved.username);
    if (!username) {
      throw new Error("Invalid username. Expected 3-32 chars with no spaces.");
    }

    if (typeof resolved.password !== "string" || resolved.password.length < PASSWORD_MIN_LENGTH) {
      throw new Error(`Invalid password. Minimum length is ${PASSWORD_MIN_LENGTH}.`);
    }

    const normalized = normalizeUsername(username);
    const user = db
      .prepare(
        `
          SELECT id, username
          FROM users
          WHERE username_normalized = ?
        `
      )
      .get(normalized);

    if (!user) {
      throw new Error(`User not found: ${username}`);
    }

    const passwordRecord = hashPassword(resolved.password);
    const now = new Date().toISOString();
    const transaction = db.transaction(() => {
      db.prepare(
        `
          UPDATE users
          SET password_hash = ?, password_salt = ?, password_algo = ?
          WHERE id = ?
        `
      ).run(passwordRecord.hashHex, passwordRecord.saltHex, passwordRecord.algo, user.id);

      if (!options.keepSessions) {
        db.prepare("DELETE FROM user_sessions WHERE user_id = ?").run(user.id);
      }
    });

    transaction();

    console.log(`Password reset complete for ${user.username}.`);
    console.log(`Database: ${options.dbPath}`);
    console.log(`Sessions revoked: ${options.keepSessions ? "no" : "yes"}`);
    console.log(`Completed at: ${now}`);
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
