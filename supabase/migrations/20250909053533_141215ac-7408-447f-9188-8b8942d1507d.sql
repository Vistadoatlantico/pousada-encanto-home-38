-- Insert admin profile for the user
INSERT INTO public.profiles (user_id, role) 
VALUES ('8ae8f2c7-e761-4481-bd72-be362eeaba18', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';