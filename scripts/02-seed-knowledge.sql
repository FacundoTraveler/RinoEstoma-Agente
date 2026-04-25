-- Seed Knowledge Base Articles for RinoEstoma
-- Inserta artículos de ejemplo sobre protocolos clínicos, procedimientos, y guías

INSERT INTO knowledge_articles (
  title,
  content,
  category,
  tags,
  is_public,
  metadata
) VALUES
(
  'Protocolo de Evaluación Inicial en Rinología',
  'La evaluación inicial debe incluir: Historia clínica detallada, Examen otoscópico, Inspección nasal anterior, Rinoscopia indirecta cuando sea necesario. La duración estimada es de 15-20 minutos. Se debe documentar síntomas nasales principales, duración, severidad, y factores desencadenantes. La evaluación completa permite identificar patología nasal, respiratoria, alérgica o funcional.',
  'protocols',
  ARRAY['evaluación', 'protocolo', 'inicial', 'rinología'],
  true,
  '{"difficulty": "intermediate", "duration_minutes": 20}'
),
(
  'Protocolo de Evaluación Miofuncional Orofacial',
  'La evaluación miofuncional incluye: Análisis estructural del sistema orofacial, Evaluación de postura y tono muscular, Test de movilidad y funcionalidad, Análisis de patrones de movimiento. Se registran hallazgos en formulario estandarizado. Duración: 30-40 minutos. Permite identificar disfunciones que afecten fonación, masticación y deglución.',
  'protocols',
  ARRAY['miofuncional', 'evaluación', 'orofacial'],
  true,
  '{"difficulty": "advanced", "duration_minutes": 35}'
),
(
  'Procedimiento de Endoscopia Nasal',
  'La endoscopia nasal permite visualización directa de cavidad nasal, rinofaringe y estructuras intranasales. Técnica: 1) Preparación con anestésico y vasoconstrictor, 2) Inserción cuidadosa del endoscopio, 3) Exploración sistemática de estructuras. Se registra hallazgos de septum, turbinatos, mucosa, y senos paranasales. Duración: 10-15 minutos.',
  'procedures',
  ARRAY['endoscopia', 'procedimiento', 'nasal'],
  true,
  '{"equipment": "endoscopio_rigido", "duration_minutes": 12}'
),
(
  'Guía de Uso de RinoMONITOR - Sesión Inicial',
  'RinoMONITOR es una plataforma de telemonitoreo clínico inteligente. Para iniciar una sesión: 1) Acceder a dashboard, 2) Seleccionar paciente, 3) Iniciar nueva sesión, 4) Conectar cámara web, 5) Seguir protocolo de evaluación. La sesión se graba automáticamente. Se genera reporte en tiempo real con métricas de funcionalidad. Duración típica: 20-30 minutos.',
  'guidelines',
  ARRAY['rinomonitor', 'telemonitoreo', 'sesión'],
  true,
  '{"tool": "rinomonitor", "access": "https://rinomonitor.com"}'
),
(
  'Tratamiento de Rinitis Alérgica - Protocolos Actuales',
  'La rinitis alérgica requiere: 1) Identificación de alérgenos, 2) Evitación ambiental, 3) Farmacoterapia (antihistamínicos, corticoides), 4) Inmunoterapia si es necesario. Se monitoreará síntomas con escala VAS. Revisión cada 2 semanas. El objetivo es control sintomático y mejoría de calidad de vida. Se pueden usar medicamentos tópicos o sistémicos según severidad.',
  'protocols',
  ARRAY['alergia', 'rinitis', 'tratamiento'],
  true,
  '{"severity_scale": "mild_moderate_severe", "followup": "2_weeks"}'
),
(
  'Disfagia Infantil - Evaluación y Manejo',
  'La disfagia infantil requiere evaluación clínica cuidadosa. Signos de alerta: atragantamientos, dificultad para succionar, salivación excesiva, problemas de alimentación. Evaluación: historia dietética, observación de alimentación, pruebas motoras orales. Puede requerir videofluoroscopia. Intervención: modificación de consistencia, técnicas de facilitación, trabajo muscular progresivo.',
  'guidelines',
  ARRAY['disfagia', 'infantil', 'evaluación'],
  true,
  '{"age_group": "pediatric", "priority": "high"}'
),
(
  'Voz Profesional - Cuidados y Prevención',
  'Pacientes con demanda vocal elevada (cantantes, docentes) requieren: 1) Educación vocal, 2) Técnicas correctas de uso de voz, 3) Higiene vocal (hidratación, descanso), 4) Calentamiento y enfriamiento de cuerdas vocales. Se pueden usar inhalaciones con vapor y ejercicios específicos. Monitoreo periódico es esencial. Evitar gritos y susurros prolongados.',
  'guidelines',
  ARRAY['voz', 'cuidados', 'prevención'],
  true,
  '{"patient_type": "professional_voice", "ongoing_monitoring": true}'
),
(
  'Protocolo de Respiración Bucal',
  'La respiración bucal puede llevar a múltiples consecuencias. Evaluación: observación de patrón respiratorio, análisis postural, evaluación miofuncional. Causas comunes: obstrucción nasal, hábitos, maloclusión. Intervención: tratar causa subyacente, conciencia del patrón, ejercicios de respiración nasal, posiblemente derivación a ortodoncista. Monitoreo mensual inicialmente.',
  'protocols',
  ARRAY['respiración', 'bucal', 'evaluación'],
  true,
  '{"requires_multidisciplinary": true, "monitoring_frequency": "monthly"}'
),
(
  'Manejo de Pacientes Adultos Mayores',
  'Consideraciones especiales para adultos mayores: Cambios fisiológicos en vía aérea, mayor riesgo de aspiración, comorbilidades, polifarmacia. Adaptaciones: evaluaciones más lentas, períodos de descanso frecuentes, evaluación de deglución cuidadosa. Envolvimiento de familia recomendado. Documentación exhaustiva de comorbilidades. Revisiones más frecuentes. Consideraciones éticas y de calidad de vida en tratamiento.',
  'guidelines',
  ARRAY['adultos_mayores', 'consideraciones_especiales'],
  true,
  '{"age_group": "elderly", "complexity": "high"}'
),
(
  'Sistema de Registro en RinoEstomatología',
  'Todo paciente requiere: 1) Historia clínica completa, 2) Consentimiento informado, 3) Evaluaciones documentadas, 4) Plan de tratamiento, 5) Seguimiento periódico. Registros deben ser: precisos, legibles, fechados, firmados. Se mantiene confidencialidad según normativas GDPR. Registros electrónicos se almacenan en Supabase con encriptación. Acceso limitado según rol y permisos.',
  'protocols',
  ARRAY['registro', 'documentación', 'privacidad'],
  true,
  '{"compliance": "GDPR", "storage": "encrypted"}'
);
