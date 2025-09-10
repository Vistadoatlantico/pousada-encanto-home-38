-- Deduplicate existing reservations by CPF digits (keep earliest)
WITH duplicates AS (
  SELECT
    id,
    regexp_replace(cpf, '[^0-9]', '', 'g') AS cpf_digits,
    row_number() OVER (
      PARTITION BY regexp_replace(cpf, '[^0-9]', '', 'g')
      ORDER BY created_at ASC
    ) AS rn
  FROM public.birthday_reservations
)
DELETE FROM public.birthday_reservations br
USING duplicates d
WHERE br.id = d.id
  AND d.rn > 1;

-- Enforce uniqueness on CPF digits regardless of formatting
CREATE UNIQUE INDEX IF NOT EXISTS ux_birthday_reservations_cpf_digits
ON public.birthday_reservations ((regexp_replace(cpf, '[^0-9]', '', 'g')));
