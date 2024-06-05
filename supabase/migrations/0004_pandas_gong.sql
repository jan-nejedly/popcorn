CREATE VIEW user_movie_statistics AS
SELECT
    r.user_id,
    SUM(CAST(REGEXP_REPLACE(m.runtime, '[^0-9]', '', 'g') AS INTEGER)) AS total_runtime,
    COUNT(r.movie_id) AS movie_count,
    ROUND(AVG(r.stars)::numeric, 1) AS average_stars
FROM
    ratings r
JOIN
    movies m ON r.movie_id = m.id
GROUP BY
    r.user_id;
