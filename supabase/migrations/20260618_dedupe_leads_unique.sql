-- PROBLÈME 1 : supprimer les doublons (user_id, post_url) en gardant le meilleur score
-- PROBLÈME 2 : supprimer les leads de test

DELETE FROM public.leads
WHERE author IN ('test_user1', 'test_user2', 'test_user3', 'test_user4', 'test_user5')
   OR post_url LIKE '%reddit.com/test%';

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, post_url
      ORDER BY intent_score DESC, created_at ASC
    ) AS rn
  FROM public.leads
  WHERE post_url IS NOT NULL
)
DELETE FROM public.leads
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS leads_user_post_url_idx
  ON public.leads (user_id, post_url)
  WHERE post_url IS NOT NULL;
