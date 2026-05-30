from flask import Flask, jsonify, render_template
import pymysql
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, TABLE_PREFIX, get_connection_string

app = Flask(__name__, static_folder="static", template_folder="templates")


def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )


def query_db(query: str, params: tuple = ()) -> list[dict]:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()


@app.route("/")
def index():
    return render_template("index.html", db_connection=get_connection_string())


@app.route("/api/summary")
def api_summary():
    prefix = TABLE_PREFIX
    status_summary = query_db(
        f"SELECT post_status AS status, COUNT(*) AS count FROM {prefix}posts WHERE post_type='post' GROUP BY post_status"
    )
    total_posts = query_db(
        f"SELECT COUNT(*) AS count FROM {prefix}posts WHERE post_type='post'"
    )[0]["count"]
    total_comments = query_db(
        f"SELECT COUNT(*) AS count FROM {prefix}comments"
    )[0]["count"]
    comments_by_status = query_db(
        f"SELECT comment_approved AS status, COUNT(*) AS count FROM {prefix}comments GROUP BY comment_approved"
    )
    recent_posts = query_db(
        f"SELECT ID AS post_id, post_title, post_date, post_status FROM {prefix}posts WHERE post_type='post' ORDER BY post_date DESC LIMIT 10"
    )
    author_summary = query_db(
        f"SELECT u.ID AS author_id, u.display_name AS author_name, COUNT(p.ID) AS post_count"
        f" FROM {prefix}users u"
        f" LEFT JOIN {prefix}posts p ON p.post_author=u.ID AND p.post_type='post'"
        f" GROUP BY u.ID ORDER BY post_count DESC LIMIT 10"
    )
    category_summary = query_db(
        f"SELECT t.name AS category, COUNT(*) AS count"
        f" FROM {prefix}posts p"
        f" JOIN {prefix}term_relationships tr ON p.ID = tr.object_id"
        f" JOIN {prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id"
        f" JOIN {prefix}terms t ON tt.term_id = t.term_id"
        f" WHERE tt.taxonomy = 'category' AND p.post_type = 'post'"
        f" GROUP BY t.term_id ORDER BY count DESC LIMIT 10"
    )
    posts_last_30_days = query_db(
        f"SELECT DATE(post_date) AS day, COUNT(*) AS count"
        f" FROM {prefix}posts"
        f" WHERE post_type = 'post' AND post_date >= CURDATE() - INTERVAL 30 DAY"
        f" GROUP BY DATE(post_date) ORDER BY day"
    )
    return jsonify(
        db_connection=get_connection_string(),
        total_posts=total_posts,
        total_comments=total_comments,
        status_summary=status_summary,
        comments_by_status=comments_by_status,
        recent_posts=recent_posts,
        author_summary=author_summary,
        category_summary=category_summary,
        posts_last_30_days=posts_last_30_days,
    )


@app.route("/api/heatmap")
def api_heatmap():
    prefix = TABLE_PREFIX
    month_category = query_db(
        f"SELECT CONCAT(YEAR(p.post_date), '-', LPAD(MONTH(p.post_date), 2, '0')) AS month,"
        f" t.name AS category, COUNT(*) AS count"
        f" FROM {prefix}posts p"
        f" JOIN {prefix}term_relationships tr ON p.ID = tr.object_id"
        f" JOIN {prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id"
        f" JOIN {prefix}terms t ON tt.term_id = t.term_id"
        f" WHERE tt.taxonomy = 'category' AND p.post_type = 'post'"
        f" AND p.post_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)"
        f" GROUP BY month, t.term_id ORDER BY month, count DESC"
    )
    top_categories = query_db(
        f"SELECT t.name AS category, COUNT(*) AS total"
        f" FROM {prefix}posts p"
        f" JOIN {prefix}term_relationships tr ON p.ID = tr.object_id"
        f" JOIN {prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id"
        f" JOIN {prefix}terms t ON tt.term_id = t.term_id"
        f" WHERE tt.taxonomy = 'category' AND p.post_type = 'post'"
        f" GROUP BY t.term_id ORDER BY total DESC LIMIT 10"
    )
    top_cat_names = [r["category"] for r in top_categories]
    category_author = query_db(
        f"SELECT t.name AS category, u.display_name AS author_name, COUNT(*) AS count"
        f" FROM {prefix}posts p"
        f" JOIN {prefix}users u ON p.post_author = u.ID"
        f" JOIN {prefix}term_relationships tr ON p.ID = tr.object_id"
        f" JOIN {prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id"
        f" JOIN {prefix}terms t ON tt.term_id = t.term_id"
        f" WHERE tt.taxonomy = 'category' AND p.post_type = 'post'"
        f" AND t.name IN ({','.join(['%s'] * len(top_cat_names))})"
        f" GROUP BY t.term_id, u.ID ORDER BY count DESC",
        tuple(top_cat_names),
    )
    return jsonify(
        month_category=month_category,
        category_author=category_author,
        top_categories=top_cat_names,
    )


@app.route("/api/ping")
def api_ping():
    try:
        query_db(f"SELECT 1 AS ok")
        return jsonify(status="ok", connection=get_connection_string())
    except Exception as exc:
        return jsonify(status="error", message=str(exc), connection=get_connection_string()), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
