export const diseaseKnowledge = {
  tomato: {
    'Early Blight': {
      severity: 'medium',
      cause: 'Fungal pressure rises in humid weather with repeated leaf wetness.',
      immediateAction: [
        'Remove visibly infected lower leaves.',
        'Improve airflow and avoid overhead irrigation.',
        'Inspect nearby plants within 24 hours.',
      ],
      organicTreatment: [
        'Use neem-based preventive spray if infection is still limited.',
        'Apply compost tea only as a mild preventive, not a cure.',
      ],
      chemicalTreatment: [
        'Use a locally approved fungicide after expert confirmation if spread continues.',
      ],
      preventionTips: [
        'Keep plant spacing open.',
        'Water at the soil line, not on leaves.',
        'Do not leave infected debris in the field.',
      ],
      radarActions: [
        'Improve drainage before the next rain spell.',
        'Inspect lower canopy daily for fresh lesions.',
        'Avoid evening irrigation this week.',
      ],
    },
  },
  potato: {
    'Late Blight': {
      severity: 'high',
      cause: 'Cool wet conditions support rapid spread through foliage.',
      immediateAction: [
        'Separate heavily affected plants immediately.',
        'Stop overhead irrigation.',
        'Inspect the full plot for fast-moving spots.',
      ],
      organicTreatment: ['Use a copper-based organic option only if locally approved.'],
      chemicalTreatment: [
        'Use a recommended blight control fungicide after local guidance.',
      ],
      preventionTips: [
        'Reduce leaf wetness duration.',
        'Improve field drainage.',
        'Avoid dense canopy conditions.',
      ],
      radarActions: [
        'Inspect canopy after every humid morning.',
        'Clear stagnant water zones.',
        'Flag suspect plants for early removal.',
      ],
    },
  },
  chili: {
    'Leaf Curl Virus': {
      severity: 'medium',
      cause: 'Vector pressure increases with whitefly infestation.',
      immediateAction: [
        'Remove severely curled plants if spread is limited.',
        'Check the underside of leaves for whiteflies.',
        'Use yellow sticky traps immediately.',
      ],
      organicTreatment: ['Use neem oil as a whitefly suppression step.'],
      chemicalTreatment: [
        'Use whitefly-targeted control only after local expert confirmation.',
      ],
      preventionTips: [
        'Control vectors early.',
        'Avoid carrying infected nursery plants into the field.',
      ],
      radarActions: [
        'Inspect nursery and field edge plants today.',
        'Add sticky traps in infested sections.',
        'Remove severely affected plants quickly.',
      ],
    },
  },
  soybean: {
    'Yellow Mosaic': {
      severity: 'medium',
      cause: 'Whitefly-driven viral pressure rises in warm humid periods.',
      immediateAction: [
        'Mark infected patches for follow-up scouting.',
        'Control whiteflies early.',
        'Avoid moving workers from infected to clean blocks without cleaning.',
      ],
      organicTreatment: ['Use neem-based vector suppression measures.'],
      chemicalTreatment: [
        'Use insecticide only after local advisory confirms whitefly surge.',
      ],
      preventionTips: [
        'Use clean seed sources.',
        'Monitor vectors at field edges.',
      ],
      radarActions: [
        'Inspect field edges first.',
        'Reduce weed hosts around the plot.',
        'Track whitefly pressure after humid afternoons.',
      ],
    },
  },
}
