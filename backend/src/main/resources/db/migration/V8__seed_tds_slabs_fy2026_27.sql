-- V8: Seeds the new-regime TDS slabs for FY2026-27, per §2 of the scoping doc.
-- A new Budget means a new seed row set for the new financial year, not a redeploy
-- or code change — this table exists precisely to keep that data, not code (§4.4).

INSERT INTO tds_slabs (financial_year, slab_order, from_amount, to_amount, rate) VALUES
    ('2026-2027', 1, 0,       400000,  0.00),
    ('2026-2027', 2, 400000,  800000,  0.05),
    ('2026-2027', 3, 800000,  1200000, 0.10),
    ('2026-2027', 4, 1200000, 1600000, 0.15),
    ('2026-2027', 5, 1600000, 2000000, 0.20),
    ('2026-2027', 6, 2000000, 2400000, 0.25),
    ('2026-2027', 7, 2400000, NULL,    0.30);
