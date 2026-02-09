-- ============================================================================
-- NORMALISATION DE LA TABLE ROOMS
-- ============================================================================

-- Vérifier quelle colonne de prix existe
DO $$ BEGIN
    -- Si base_price_per_night existe mais pas base_price, créer base_price
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'rooms' AND column_name = 'base_price_per_night')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'rooms' AND column_name = 'base_price') THEN
        ALTER TABLE rooms ADD COLUMN base_price DECIMAL(10,2);
        UPDATE rooms SET base_price = base_price_per_night WHERE base_price IS NULL;
    END IF;
    
    -- Si price existe mais pas base_price, créer base_price
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'rooms' AND column_name = 'price')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'rooms' AND column_name = 'base_price') THEN
        ALTER TABLE rooms ADD COLUMN base_price DECIMAL(10,2);
        UPDATE rooms SET base_price = price WHERE base_price IS NULL;
    END IF;
    
    -- Assurez-vous que status est 'available' par défaut
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'status') THEN
        ALTER TABLE rooms ADD COLUMN status VARCHAR(20) DEFAULT 'available';
    END IF;
    
END $$;

-- S'assurer que max_guests existe
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'max_guests') THEN
        ALTER TABLE rooms ADD COLUMN max_guests INTEGER DEFAULT 2;
    END IF;
END $$;
