import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env or .env.local
ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env"
ENV_LOCAL_FILE = ROOT / ".env.local"

# Load from .env first (production), then .env.local (local development)
if ENV_FILE.exists():
    load_dotenv(ENV_FILE, override=True)
elif ENV_LOCAL_FILE.exists():
    load_dotenv(ENV_LOCAL_FILE, override=True)


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


def clean_env_value(value: str | None, default: str) -> str:
    if value is None:
        return default
    return value.strip().strip('"').strip("'")


DB_HOST = env_or_file("WP_DB_HOST") or env_or_file("HOST") or "127.0.0.1"
DB_PORT = int(env_or_file("WP_DB_PORT") or env_or_file("PORT") or 3306)
DB_USER = env_or_file("WP_DB_USER") or env_or_file("USER") or "root"
DB_PASSWORD = env_or_file("WP_DB_PASSWORD") or env_or_file("PASSWORD") or ""
DB_NAME = env_or_file("WP_DB_NAME") or env_or_file("DATABASE") or env_or_file("DEFAULT_SCHEMA") or "wordpress"
TABLE_PREFIX = env_or_file("WP_TABLE_PREFIX") or "wp_"


def _to_int(value: str | None, default: int) -> int:
    try:
        return int(value) if value is not None else default
    except (TypeError, ValueError):
        return default


SITE_CONFIGS: dict[str, dict[str, str | int]] = {
    "tech360d": {
        "label": clean_env_value(os.getenv("SITE_TECH360D_LABEL"), "Tech360d"),
        "site_url": clean_env_value(os.getenv("SITE_TECH360D_URL"), "https://tech360d.com"),
        "host": clean_env_value(os.getenv("SITE_TECH360D_HOST"), "srv1060.hstgr.io"),
        "port": _to_int(os.getenv("SITE_TECH360D_PORT"), 3306),
        "user": clean_env_value(os.getenv("SITE_TECH360D_USER"), "u974173543_zbBHi"),
        "password": clean_env_value(os.getenv("SITE_TECH360D_PASSWORD"), "Tech360d@123"),
        "database": clean_env_value(os.getenv("SITE_TECH360D_DATABASE"), "u974173543_cDve6"),
        "prefix": clean_env_value(os.getenv("SITE_TECH360D_PREFIX"), "wp_"),
    },
    "techinfobeez": {
        "label": clean_env_value(os.getenv("SITE_TECHINFOBEEZ_LABEL"), "Techinfobeez"),
        "site_url": clean_env_value(os.getenv("SITE_TECHINFOBEEZ_URL"), "https://techinfobeez.com"),
        "host": clean_env_value(os.getenv("SITE_TECHINFOBEEZ_HOST"), "srv1060.hstgr.io"),
        "port": _to_int(os.getenv("SITE_TECHINFOBEEZ_PORT"), 3306),
        "user": clean_env_value(os.getenv("SITE_TECHINFOBEEZ_USER"), "u974173543_mzHeJ"),
        "password": clean_env_value(os.getenv("SITE_TECHINFOBEEZ_PASSWORD"), "pC0unDJsnO"),
        "database": clean_env_value(os.getenv("SITE_TECHINFOBEEZ_DATABASE"), "u974173543_nVwks"),
        "prefix": clean_env_value(os.getenv("SITE_TECHINFOBEEZ_PREFIX"), "wp_"),
    },
    "fashionsgalaxy": {
        "label": clean_env_value(os.getenv("SITE_FASHIONSGALAXY_LABEL"), "Fashionsgalaxy"),
        "site_url": clean_env_value(os.getenv("SITE_FASHIONSGALAXY_URL"), "https://fashionsgalaxy.com"),
        "host": clean_env_value(os.getenv("SITE_FASHIONSGALAXY_HOST"), "srv1060.hstgr.io"),
        "port": _to_int(os.getenv("SITE_FASHIONSGALAXY_PORT"), 3306),
        "user": clean_env_value(os.getenv("SITE_FASHIONSGALAXY_USER"), "u974173543_DZczJ"),
        "password": clean_env_value(os.getenv("SITE_FASHIONSGALAXY_PASSWORD"), "1OWcFRY4q6"),
        "database": clean_env_value(os.getenv("SITE_FASHIONSGALAXY_DATABASE"), "u974173543_dDSm1"),
        "prefix": clean_env_value(os.getenv("SITE_FASHIONSGALAXY_PREFIX"), "wp_"),
    },
    "techsprohub": {
        "label": clean_env_value(os.getenv("SITE_TECHSPROHUB_LABEL"), "Techsprohub"),
        "site_url": clean_env_value(os.getenv("SITE_TECHSPROHUB_URL"), "https://techsprohub.com"),
        "host": clean_env_value(os.getenv("SITE_TECHSPROHUB_HOST"), DB_HOST),
        "port": _to_int(os.getenv("SITE_TECHSPROHUB_PORT"), DB_PORT),
        "user": clean_env_value(os.getenv("SITE_TECHSPROHUB_USER"), DB_USER),
        "password": clean_env_value(os.getenv("SITE_TECHSPROHUB_PASSWORD"), DB_PASSWORD),
        "database": clean_env_value(os.getenv("SITE_TECHSPROHUB_DATABASE"), DB_NAME),
        "prefix": clean_env_value(os.getenv("SITE_TECHSPROHUB_PREFIX"), TABLE_PREFIX),
    },
}

DEFAULT_SITE_KEY = os.getenv("DASHBOARD_DEFAULT_SITE", "techsprohub")


def get_default_site_key() -> str:
    return DEFAULT_SITE_KEY if DEFAULT_SITE_KEY in SITE_CONFIGS else "techsprohub"


def get_site_config(site_key: str | None = None) -> dict[str, str | int]:
    key = site_key or get_default_site_key()
    return SITE_CONFIGS.get(key, SITE_CONFIGS[get_default_site_key()])


def get_available_sites() -> list[dict[str, str]]:
    sites: list[dict[str, str]] = []
    for key, cfg in SITE_CONFIGS.items():
        sites.append({"key": key, "label": str(cfg["label"])})
    return sites


def get_site_public_url(site_key: str | None = None) -> str:
    cfg = get_site_config(site_key)
    raw_url = str(cfg.get("site_url", "")).strip()
    if not raw_url:
        return ""
    if raw_url.startswith("http://") or raw_url.startswith("https://"):
        return raw_url.rstrip("/")
    return f"https://{raw_url.rstrip('/')}"


def get_connection_string() -> str:
    return f"{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME} (prefix={TABLE_PREFIX})"


def get_connection_string_for_site(site_key: str | None = None) -> str:
    cfg = get_site_config(site_key)
    return (
        f"{cfg['user']}@{cfg['host']}:{cfg['port']}/{cfg['database']} "
        f"(prefix={cfg['prefix']})"
    )


# Cache Configuration
CACHE_TYPE = "SimpleCache"
CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes for API responses
CACHE_SUMMARY_TIMEOUT = 600  # 10 minutes for summary queries
CACHE_HEATMAP_TIMEOUT = 900  # 15 minutes for expensive heatmap queries
