
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
    { name: 'Crossover na polia', sets: 3, reps: 12 },
    { name: 'Peck deck', sets: 3, reps: 12 },
  ],
  Costas: [
    { name: 'Puxada frontal', sets: 4, reps: 10 },
    { name: 'Remada curvada', sets: 3, reps: 12 },
    { name: 'Remada baixa', sets: 3, reps: 12 },
    { name: 'Barra fixa assistida', sets: 3, reps: 8 },
    { name: 'Pulldown com corda', sets: 3, reps: 12 },
    { name: 'Levantamento terra', sets: 4, reps: 8 },
  ],
  Ombros: [
    { name: 'Desenvolvimento com halteres', sets: 4, reps: 10 },
    { name: 'Elevação lateral', sets: 3, reps: 12 },
    { name: 'Elevação frontal', sets: 3, reps: 12 },
    { name: 'Encolhimento', sets: 3, reps: 15 },
    { name: 'Remada alta', sets: 3, reps: 12 },
    { name: 'Crucifixo inverso', sets: 3, reps: 12 },
  ],
  Bíceps: [
    { name: 'Rosca direta', sets: 3, reps: 12 },
    { name: 'Rosca alternada', sets: 3, reps: 12 },
    { name: 'Rosca martelo', sets: 3, reps: 12 },
    { name: 'Rosca concentrada', sets: 3, reps: 12 },
    { name: 'Rosca scott', sets: 3, reps: 10 },
  ],
  Tríceps: [
    { name: 'Tríceps na polia', sets: 3, reps: 12 },
    { name: 'Tríceps testa', sets: 3, reps: 10 },
    { name: 'Mergulho no banco', sets: 3, reps: 12 },
    { name: 'Tríceps francês', sets: 3, reps: 12 },
    { name: 'Tríceps corda', sets: 3, reps: 15 },
  ],
  Quadríceps: [
    { name: 'Agachamento livre', sets: 4, reps: 10 },
    { name: 'Leg press 45°', sets: 4, reps: 12 },
    { name: 'Cadeira extensora', sets: 3, reps: 12 },
    { name: 'Afundo', sets: 3, reps: 10 },
    { name: 'Agachamento búlgaro', sets: 3, reps: 10 },
    { name: 'Hack machine', sets: 4, reps: 10 },
  ],
  Posteriores: [
    { name: 'Mesa flexora', sets: 3, reps: 12 },
    { name: 'Stiff', sets: 3, reps: 10 },
    { name: 'Cadeira flexora', sets: 3, reps: 12 },
    { name: 'Levantamento terra romeno', sets: 3, reps: 10 },
    { name: 'Flexão nórdica', sets: 3, reps: 8 },
  ],
  Glúteos: [
    { name: 'Elevação pélvica', sets: 4, reps: 12 },
    { name: 'Cadeira abdutora', sets: 3, reps: 15 },
    { name: 'Agachamento sumô', sets: 3, reps: 12 },
    { name: 'Coice na polia', sets: 3, reps: 12 },
    { name: 'Passada com halteres', sets: 3, reps: 12 },
    { name: 'Abdução na polia', sets: 3, reps: 15 },
  ],
  Panturrilhas: [
    { name: 'Panturrilha em pé', sets: 4, reps: 15 },
    { name: 'Panturrilha sentado', sets: 4, reps: 15 },
    { name: 'Panturrilha no leg press', sets: 3, reps: 15 },
    { name: 'Panturrilha unilateral', sets: 3, reps: 12 },
    { name: 'Saltos na corda', sets: 3, reps: 30 },
  ],
};


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
