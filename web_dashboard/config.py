import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env or .env.local
ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env"
ENV_LOCAL_FILE = ROOT / ".env.local"

# Load from .env first (production), then .env.local (local development)
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
elif ENV_LOCAL_FILE.exists():
    load_dotenv(ENV_LOCAL_FILE)


def parse_credentials_file(filename: str) -> dict[str, str]:
    path = Path(filename)
    if not path.exists():
        return {}

    credentials = {}
    for raw_line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        credentials[key.strip().upper().replace(" ", "_")] = value.strip()
    return credentials


BLOG_DB_FILE = ROOT / "blog_db.sql"
LOCAL_CREDS_FILE = ROOT / "localdb_creds.sql"

FILE_CREDS = parse_credentials_file(BLOG_DB_FILE)
if not FILE_CREDS:
    FILE_CREDS = parse_credentials_file(LOCAL_CREDS_FILE)


def env_or_file(key: str, default: str | None = None) -> str | None:
    return os.getenv(key) or FILE_CREDS.get(key) or default


DB_HOST = env_or_file("WP_DB_HOST") or env_or_file("HOST") or "127.0.0.1"
DB_PORT = int(env_or_file("WP_DB_PORT") or env_or_file("PORT") or 3306)
DB_USER = env_or_file("WP_DB_USER") or env_or_file("USER") or "root"
DB_PASSWORD = env_or_file("WP_DB_PASSWORD") or env_or_file("PASSWORD") or ""
DB_NAME = env_or_file("WP_DB_NAME") or env_or_file("DATABASE") or env_or_file("DEFAULT_SCHEMA") or "wordpress"
TABLE_PREFIX = env_or_file("WP_TABLE_PREFIX") or "wp_"


def get_connection_string() -> str:
    return f"{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME} (prefix={TABLE_PREFIX})"
