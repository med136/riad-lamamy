-- Add Content Studio registrations for public pages with editable Hero media.
insert into public.cms_page_sections (page_key, section_key, label, position, is_visible, settings)
values
  ('rooms','hero','Hero',10,true,'{}'::jsonb),
  ('services','hero','Hero',10,true,'{}'::jsonb),
  ('gallery','hero','Hero',10,true,'{}'::jsonb),
  ('reservations','hero','Hero',10,true,'{}'::jsonb),
  ('contact','hero','Hero',10,true,'{}'::jsonb)
on conflict (page_key, section_key) do nothing;
