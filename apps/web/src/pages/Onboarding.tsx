import { useState } from 'react';
import { api } from '../lib/api';

export function Onboarding() {
  const [email, setEmail] = useState('');
  const [mentors, setMentors] = useState('');
  const [motivation, setMotivation] = useState('');
  const [expectation, setExpectation] = useState('');
  const [habitGoal, setHabitGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // 1) Crear usuario
      const userRes = await api.post('/users', {
        email,
        fullName: email.split('@')[0] || 'Participante',
        mentorIds: mentors
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        motivation: motivation || null,
        expectation: expectation || null,
        emailContact: email,
        habitGoal: habitGoal || null,
      });
      const userId = userRes.data.id as string;

      // 2) Crear reto activo inmediato
      await api.post('/challenges', {
        userId,
        startsAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota',
        goalDescription: habitGoal || 'Hábito principal del reto 28 días',
      });

      setMessage('Perfil y reto creados. ¡Listo para empezar!');
    } catch (error: any) {
      setMessage(error?.response?.data?.message || error.message || 'Error al crear el perfil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Onboarding</h2>
      <p>Completa tu perfil para iniciar tu reto de 28 días.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Correo
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </label>
        <label>
          Mentores (separados por comas)
          <input
            type="text"
            value={mentors}
            onChange={(e) => setMentors(e.target.value)}
            placeholder="James Clear, Cal Newport"
          />
        </label>
        <label>
          Motivación
          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="¿Por qué empiezas este reto?"
          />
        </label>
        <label>
          Expectativa
          <textarea
            value={expectation}
            onChange={(e) => setExpectation(e.target.value)}
            placeholder="¿Qué esperas lograr en 28 días?"
          />
        </label>
        <label>
          ¿Qué hábito quieres adquirir o mejorar?
          <input
            type="text"
            value={habitGoal}
            onChange={(e) => setHabitGoal(e.target.value)}
            placeholder="Ej: Meditar 10 minutos diarios"
          />
        </label>
        <button disabled={loading} type="submit">
          {loading ? 'Guardando...' : 'Crear perfil y reto'}
        </button>
      </form>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}


