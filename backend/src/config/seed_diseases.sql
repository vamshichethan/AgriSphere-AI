-- ============================================================
-- AgriFlow Disease Catalogue Seed Data
-- Covers all 5 crops from Kaggle Dataset 2 (kamal01)
-- ============================================================

INSERT INTO disease_catalogue (crop_name, disease_name, scientific_name, symptoms, organic_treatment, chemical_treatment, prevention_measures, severity) VALUES

-- ─── TOMATO ───────────────────────────────────────────────────
('Tomato', 'Tomato_Early_Blight', 'Alternaria solani',
 'Dark brown spots with concentric rings on lower/older leaves. Yellowing around spots. Defoliation in severe cases.',
 'Apply neem oil spray (5ml/L water) every 7 days. Remove infected leaves. Compost tea spray for mild infections.',
 'Mancozeb 75% WP @ 2g/L or Chlorothalonil @ 2.5g/L. Apply at 10-14 day intervals.',
 'Crop rotation every 2 seasons. Avoid overhead irrigation. Stake plants for air circulation. Use certified disease-free seeds.',
 'Medium'),

('Tomato', 'Tomato_Late_Blight', 'Phytophthora infestans',
 'Water-soaked lesions on leaves and stems turning brown/black. White fuzzy mold on leaf undersides. Fruits develop firm brown lesions.',
 'Spray copper-based fungicides (Bordeaux mixture 1%). Remove and burn affected plants immediately. Plant resistant varieties.',
 'Metalaxyl + Mancozeb @ 2.5g/L. Cymoxanil + Mancozeb @ 2g/L. Begin at first symptom appearance.',
 'Avoid overhead irrigation. Plant in well-drained soil. Destroy infected plant debris. Monitor humidity levels.',
 'Critical'),

('Tomato', 'Tomato_Leaf_Mold', 'Passalora fulva',
 'Pale greenish-yellow spots on upper leaf surface. Olive-green to grayish velvet mold on undersides.',
 'Remove infected leaves. Improve greenhouse ventilation. Apply baking soda solution (1 tsp/L water).',
 'Chlorothalonil @ 2g/L or Mancozeb 75% WP @ 2g/L every 10 days.',
 'Maintain relative humidity below 85%. Use resistant varieties. Space plants adequately.',
 'Medium'),

('Tomato', 'Tomato_Bacterial_Spot', 'Xanthomonas vesicatoria',
 'Small, water-soaked spots on leaves, stems, and fruits. Spots enlarge to brown lesions with yellow halo. Fruit develops raised, scabby spots.',
 'Copper-based sprays (Bordeaux mixture). Remove infected plant parts. Avoid working in wet conditions.',
 'Copper hydroxide @ 2g/L. Streptomycin sulfate @ 0.5g/L. Avoid broad-spectrum fungicides.',
 'Use certified pathogen-free seeds. Avoid overhead irrigation. Practice 2-year crop rotation.',
 'High'),

('Tomato', 'Tomato_Target_Spot', 'Corynespora cassiicola',
 'Circular brown spots with concentric rings creating target-board appearance. Spots may merge causing leaf drop.',
 'Neem-based sprays. Remove affected leaves. Improve air circulation around plants.',
 'Azoxystrobin @ 1ml/L or Difenoconazole @ 1ml/L. Rotate fungicide classes.',
 'Avoid wetting foliage. Use drip irrigation. Remove plant debris after harvest.',
 'Medium'),

-- ─── POTATO ───────────────────────────────────────────────────
('Potato', 'Potato_Early_Blight', 'Alternaria solani',
 'Dark brown spots with yellow halos on lower older leaves. Concentric ring pattern. Premature leaf death reduces tuber size.',
 'Apply neem oil @ 5ml/L. Remove affected leaves. Seaweed extract as a growth booster.',
 'Mancozeb 75% WP @ 2g/L every 7-10 days. Switch to Azoxystrobin if resistance develops.',
 'Plant certified seed potatoes. Maintain balanced nitrogen nutrition. Avoid excessive irrigation.',
 'Medium'),

('Potato', 'Potato_Late_Blight', 'Phytophthora infestans',
 'Irregular water-soaked grayish-brown lesions on leaves. White sporulation on leaf undersides in humid weather. Tubers develop brown rot.',
 'Bordeaux mixture 1% at first sign. Destroy infected haulms before harvest. Avoid infected areas.',
 'Metalaxyl + Mancozeb @ 2.5g/L. Cymoxanil @ 0.6g/L. Begin preventively in wet seasons.',
 'Use blight-resistant varieties. Ensure good soil drainage. Monitor weather forecasts for blight warnings.',
 'Critical'),

-- ─── CORN ─────────────────────────────────────────────────────
('Corn', 'Corn_Common_Rust', 'Puccinia sorghi',
 'Small, circular to elongate, cinnamon-brown pustules on both leaf surfaces. Severely infected leaves may die.',
 'Apply sulfur-based fungicide. Remove severely infected leaves. Ensure proper plant spacing.',
 'Propiconazole @ 1ml/L or Tebuconazole @ 1ml/L. Most effective when applied early.',
 'Plant rust-resistant hybrid varieties. Avoid late planting in high humidity areas. Monitor from tasseling stage.',
 'Medium'),

('Corn', 'Corn_Northern_Leaf_Blight', 'Exserohilum turcicum',
 'Long, elliptical gray-green to tan lesions (2.5-15cm) on leaves. Lesions run parallel to leaf margins.',
 'Remove infected plant material. Ensure crop rotation with non-host crops. Balanced fertilization.',
 'Azoxystrobin @ 1ml/L or Propiconazole @ 1ml/L. Apply at VT/R1 growth stage.',
 'Use resistant varieties. Rotate with soybean or wheat. Incorporate residue after harvest.',
 'High'),

('Corn', 'Corn_Gray_Leaf_Spot', 'Cercospora zeae-maydis',
 'Rectangular tan to gray lesions restricted by leaf veins. Lesions have distinct parallel edges.',
 'Improve air circulation. Reduce thatch. Apply calcium silicate to strengthen cell walls.',
 'Strobilurin fungicides (Azoxystrobin) + DMI fungicides (Propiconazole) combination sprays.',
 'Crop rotation. Tillage to reduce surface residue. Plant resistant hybrids. Avoid continuous corn.',
 'High'),

-- ─── RICE ─────────────────────────────────────────────────────
('Rice', 'Rice_Leaf_Blast', 'Magnaporthe oryzae',
 'Diamond-shaped lesions with gray centers and brown borders on leaves. Lesions may coalesce killing entire leaves.',
 'Silicon fertilization strengthens cell walls. Remove infected plant material. Maintain optimal water levels.',
 'Tricyclazole 75% WP @ 0.6g/L. Isoprothiolane @ 1.5ml/L. Apply at first symptom appearance.',
 'Use blast-resistant varieties. Avoid excessive nitrogen fertilization. Maintain proper water management.',
 'High'),

('Rice', 'Rice_Neck_Blast', 'Magnaporthe oryzae',
 'Gray lesion at the neck of the panicle. Entire panicle may break. Causes significant yield loss.',
 'Silicon sprays. Burn infected crop residue. Improve drainage to reduce humidity.',
 'Tricyclazole 75% WP @ 0.6g/L at panicle initiation and heading stages. Critical timing.',
 'Use resistant varieties. Balanced NPK fertilization. Avoid late transplanting. Monitor at heading stage.',
 'Critical'),

('Rice', 'Rice_Brown_Spot', 'Helminthosporium oryzae',
 'Circular to oval dark brown spots with gray centers on leaves. Spots have brown margins. Seed discoloration.',
 'Potassium fertilization improves resistance. Hot water seed treatment (52°C for 30 min).',
 'Mancozeb 75% WP @ 2g/L or Iprobenfos @ 1ml/L. Seed treatment with Thiram @ 2g/kg.',
 'Use certified healthy seeds. Balanced silicon and potassium nutrition. Proper water management.',
 'Medium'),

-- ─── WHEAT ────────────────────────────────────────────────────
('Wheat', 'Wheat_Leaf_Rust', 'Puccinia triticina',
 'Small, circular to oval, orange-brown pustules on leaf upper surface. Surrounded by yellow halo in susceptible varieties.',
 'Remove alternate host plants (barberry). Use biocontrol agent Trichoderma. Balanced nutrition.',
 'Propiconazole 25% EC @ 1ml/L. Tebuconazole @ 1ml/L. Apply at flag leaf emergence.',
 'Plant rust-resistant varieties. Avoid late sowing. Use certified seeds. Monitor from tillering stage.',
 'High'),

('Wheat', 'Wheat_Stripe_Rust', 'Puccinia striiformis',
 'Yellow-orange pustules arranged in stripes along leaf veins. Infection at cooler temperatures. Severe leaf damage.',
 'Ensure good air circulation. Avoid dense sowing. Silicon application reduces severity.',
 'Propiconazole @ 1ml/L or Hexaconazole @ 1ml/L. Apply preventively in epidemic-prone areas.',
 'Use resistant/tolerant varieties. Early sowing. Avoid high nitrogen in epidemic years.',
 'High'),

('Wheat', 'Wheat_Stem_Rust', 'Puccinia graminis',
 'Reddish-brown, elongated pustules on stems and leaf sheaths. Pustules rupture with reddish-brown spores. Plant lodging.',
 'Burn infected stubble. Remove barberry plants nearby. Biocontrol with Bacillus subtilis.',
 'Propiconazole 25% EC @ 1ml/L. Apply at first pustule appearance. Repeat after 15 days.',
 'Grow resistant varieties (critical). Avoid late planting. Integrated rust management.',
 'Critical');
