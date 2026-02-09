-- ============================================================================
-- DONNÉES DE TEST POUR LE PANEL ADMIN
-- ============================================================================

-- Nettoyage des tables (optionnel, commenté par sécurité)
-- TRUNCATE TABLE reservations, rooms, services, gallery, testimonials CASCADE;

-- Réservations de test
INSERT INTO reservations (reference, guest_name, guest_email, guest_phone, guest_count, check_in, check_out, total_amount, status) VALUES
('RES2024001', 'Sophie Martin', 'sophie.martin@email.com', '+33 6 12 34 56 78', 2, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 2250.00, 'confirmed'),
('RES2024002', 'Ahmed Alami', 'ahmed.alami@email.com', '+212 6 11 22 33 44', 4, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '12 days', 3600.00, 'pending'),
('RES2024003', 'John Smith', 'john.smith@email.com', '+1 555 123 4567', 2, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 1400.00, 'completed')
ON CONFLICT (reference) DO NOTHING;

-- Témoignages de test
INSERT INTO testimonials (guest_name, guest_country, rating, content, approved, featured) VALUES
('Marie Dubois', 'France', 5, 'Un séjour magnifique dans un cadre exceptionnel. Le personnel est aux petits soins !', true, true),
('Carlos Rodriguez', 'Espagne', 4, 'Très beau riad, la décoration est superbe. Petit déjeuner délicieux.', true, true),
('Emma Wilson', 'Angleterre', 5, 'Absolutely stunning! The royal suite was beyond our expectations. We''ll be back!', true, true)
ON CONFLICT DO NOTHING;

-- Images pour la galerie
INSERT INTO gallery (title, description, image_url, category, featured) VALUES
('Cour intérieure', 'La magnifique cour centrale avec sa fontaine', '/images/gallery/cour-interieure.jpg', 'architecture', true),
('Suite Royale', 'Vue sur la chambre principale de la Suite Royale', '/images/gallery/suite-royale.jpg', 'chambres', true),
('Terrasse panoramique', 'Vue depuis la terrasse sur les toits de Marrakech', '/images/gallery/terrasse.jpg', 'vues', true),
('Spa traditionnel', 'Notre espace bien-être avec hammam', '/images/gallery/spa.jpg', 'services', false)
ON CONFLICT DO NOTHING;

