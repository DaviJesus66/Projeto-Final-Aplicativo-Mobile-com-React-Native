// Catálogo de grupos, músculos e ficha de exercícios sugerida (séries x repetições).
export const GROUPS = [
  {
    id: 'superiores',
    label: 'Membros superiores',
    icon: 'barbell-outline',
    muscles: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'],
  },
  {
    id: 'inferiores',
    label: 'Membros inferiores',
    icon: 'walk-outline',
    muscles: ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas'],
  },
];

export const EXERCISES = {
  Peito: [
    { name: 'Supino reto', sets: 4, reps: 10 },
    { name: 'Supino inclinado com halteres', sets: 3, reps: 12 },
    { name: 'Crucifixo', sets: 3, reps: 12 },
    { name: 'Flexão de braço', sets: 3, reps: 15 },
  ],
  Costas: [
    { name: 'Puxada frontal', sets: 4, reps: 10 },
    { name: 'Remada curvada', sets: 3, reps: 12 },
    { name: 'Remada baixa', sets: 3, reps: 12 },
    { name: 'Barra fixa assistida', sets: 3, reps: 8 },
  ],
  Ombros: [
    { name: 'Desenvolvimento com halteres', sets: 4, reps: 10 },
    { name: 'Elevação lateral', sets: 3, reps: 12 },
    { name: 'Elevação frontal', sets: 3, reps: 12 },
    { name: 'Encolhimento', sets: 3, reps: 15 },
  ],
  Bíceps: [
    { name: 'Rosca direta', sets: 3, reps: 12 },
    { name: 'Rosca alternada', sets: 3, reps: 12 },
    { name: 'Rosca martelo', sets: 3, reps: 12 },
  ],
  Tríceps: [
    { name: 'Tríceps na polia', sets: 3, reps: 12 },
    { name: 'Tríceps testa', sets: 3, reps: 10 },
    { name: 'Mergulho no banco', sets: 3, reps: 12 },
  ],
  Quadríceps: [
    { name: 'Agachamento livre', sets: 4, reps: 10 },
    { name: 'Leg press 45°', sets: 4, reps: 12 },
    { name: 'Cadeira extensora', sets: 3, reps: 12 },
    { name: 'Afundo', sets: 3, reps: 10 },
  ],
  Posteriores: [
    { name: 'Mesa flexora', sets: 3, reps: 12 },
    { name: 'Stiff', sets: 3, reps: 10 },
    { name: 'Cadeira flexora', sets: 3, reps: 12 },
  ],
  Glúteos: [
    { name: 'Elevação pélvica', sets: 4, reps: 12 },
    { name: 'Cadeira abdutora', sets: 3, reps: 15 },
    { name: 'Agachamento sumô', sets: 3, reps: 12 },
    { name: 'Coice na polia', sets: 3, reps: 12 },
  ],
  Panturrilhas: [
    { name: 'Panturrilha em pé', sets: 4, reps: 15 },
    { name: 'Panturrilha sentado', sets: 4, reps: 15 },
    { name: 'Panturrilha no leg press', sets: 3, reps: 15 },
  ],
};

// Lista usada no Modal de escolha do músculo (sem digitação livre).
export const MUSCLE_OPTIONS = GROUPS.flatMap((g) =>
  g.muscles.map((m) => ({ value: m, label: m, hint: g.label }))
);

export function groupOfMuscle(muscle) {
  const found = GROUPS.find((g) => g.muscles.includes(muscle));
  return found ? found.id : null;
}

export function groupById(id) {
  return GROUPS.find((g) => g.id === id);
}
