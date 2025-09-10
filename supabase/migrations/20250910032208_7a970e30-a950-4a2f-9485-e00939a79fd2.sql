-- Update location information with correct address
UPDATE public.location_content SET 
  address = 'R. Vista do Atlântico, Quadra 02, N12, Jacarecica, Maceió - AL, 57038',
  rating = '4.2 ⭐⭐⭐⭐',
  reviews_count = '1.204 avaliações',
  updated_at = now()
WHERE location_name = 'Paradise Vista do Atlântico';