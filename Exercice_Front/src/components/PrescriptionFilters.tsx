/**
 * Composant de filtrage des prescriptions
 */

import { useState, useRef, useEffect } from 'react';
import type { PrescriptionFilters as Filters, Patient, Medication, PrescriptionStatus } from '../types/api';
import { getStatusLabel } from '../utils/formatters';
import { PRESCRIPTION_STATUSES } from '../constants/prescriptions';

type SingleDateOp = 'exact' | 'gte' | 'lte' | 'gt' | 'lt';
type DateOp = SingleDateOp | 'interval';

const DATE_OPS: { value: DateOp; label: string }[] = [
  { value: 'gte', label: '>=' },
  { value: 'lte', label: '<=' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'exact', label: '=' },
  { value: 'interval', label: 'intervalle' },
];

const START_DATE_KEYS: (keyof Filters)[] = [
  'start_date', 'start_date_gte', 'start_date_lte', 'start_date_gt', 'start_date_lt',
];
const END_DATE_KEYS: (keyof Filters)[] = [
  'end_date', 'end_date_gte', 'end_date_lte', 'end_date_gt', 'end_date_lt',
];

const startKeyFor = (op: SingleDateOp): keyof Filters =>
  op === 'exact' ? 'start_date' : (`start_date_${op}` as keyof Filters);

const endKeyFor = (op: SingleDateOp): keyof Filters =>
  op === 'exact' ? 'end_date' : (`end_date_${op}` as keyof Filters);

interface Props {
  onFilterChange: (filters: Filters) => void;
  patients: Patient[];
  medications: Medication[];
}

export const PrescriptionFilters = ({ onFilterChange, patients, medications }: Props) => {
  const [filters, setFilters] = useState<Filters>({});
  const [startOp, setStartOp] = useState<DateOp>('gte');
  const [endOp, setEndOp] = useState<DateOp>('lte');

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup debounce timeout on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const applyFilters = (newFilters: Filters) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onFilterChange(newFilters), 400);
  };

  const handleChange = (key: keyof Filters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k as keyof Filters] === undefined) delete newFilters[k as keyof Filters];
    });
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // --- Single-date handlers ---

  const handleStartDate = (date: string) => {
    const newFilters = { ...filters } as Record<string, string | number | undefined>;
    START_DATE_KEYS.forEach((k) => delete newFilters[k]);
    if (date) newFilters[startKeyFor(startOp as SingleDateOp)] = date;
    const f = newFilters as Filters;
    setFilters(f);
    applyFilters(f);
  };

  const handleStartOp = (op: DateOp) => {
    setStartOp(op);
    const newFilters = { ...filters } as Record<string, string | number | undefined>;
    START_DATE_KEYS.forEach((k) => delete newFilters[k]);
    // Preserve date only when switching between two single-date operators
    if (op !== 'interval' && startOp !== 'interval') {
      const currentDate = filters[startKeyFor(startOp as SingleDateOp)] as string | undefined;
      if (currentDate) newFilters[startKeyFor(op as SingleDateOp)] = currentDate;
    }
    const f = newFilters as Filters;
    setFilters(f);
    applyFilters(f);
  };

  const handleEndDate = (date: string) => {
    const newFilters = { ...filters } as Record<string, string | number | undefined>;
    END_DATE_KEYS.forEach((k) => delete newFilters[k]);
    if (date) newFilters[endKeyFor(endOp as SingleDateOp)] = date;
    const f = newFilters as Filters;
    setFilters(f);
    applyFilters(f);
  };

  const handleEndOp = (op: DateOp) => {
    setEndOp(op);
    const newFilters = { ...filters } as Record<string, string | number | undefined>;
    END_DATE_KEYS.forEach((k) => delete newFilters[k]);
    if (op !== 'interval' && endOp !== 'interval') {
      const currentDate = filters[endKeyFor(endOp as SingleDateOp)] as string | undefined;
      if (currentDate) newFilters[endKeyFor(op as SingleDateOp)] = currentDate;
    }
    const f = newFilters as Filters;
    setFilters(f);
    applyFilters(f);
  };

  // --- Interval handlers ---

  const handleStartIntervalFrom = (date: string) => {
    const newFilters = { ...filters } as Record<string, string | number | undefined>;
    START_DATE_KEYS.forEach((k) => delete newFilters[k]);
    const to = filters.start_date_lte;
    if (to) newFilters['start_date_lte'] = to;
    if (date) newFilters['start_date_gte'] = date;
    const f = newFilters as Filters;
    setFilters(f);
    applyFilters(f);
  };

  const handleStartIntervalTo = (date: string) => {
    const newFilters = { ...filters } as Record<string, string | number | undefined>;
    START_DATE_KEYS.forEach((k) => delete newFilters[k]);
    const from = filters.start_date_gte;
    if (from) newFilters['start_date_gte'] = from;
    if (date) newFilters['start_date_lte'] = date;
    const f = newFilters as Filters;
    setFilters(f);
    applyFilters(f);
  };

  const handleEndIntervalFrom = (date: string) => {
    const newFilters = { ...filters } as Record<string, string | number | undefined>;
    END_DATE_KEYS.forEach((k) => delete newFilters[k]);
    const to = filters.end_date_lte;
    if (to) newFilters['end_date_lte'] = to;
    if (date) newFilters['end_date_gte'] = date;
    const f = newFilters as Filters;
    setFilters(f);
    applyFilters(f);
  };

  const handleEndIntervalTo = (date: string) => {
    const newFilters = { ...filters } as Record<string, string | number | undefined>;
    END_DATE_KEYS.forEach((k) => delete newFilters[k]);
    const from = filters.end_date_gte;
    if (from) newFilters['end_date_gte'] = from;
    if (date) newFilters['end_date_lte'] = date;
    const f = newFilters as Filters;
    setFilters(f);
    applyFilters(f);
  };

  const handleReset = () => {
    clearTimeout(debounceRef.current);
    setFilters({});
    setStartOp('gte');
    setEndOp('lte');
    onFilterChange({});
  };

  // Derived values read back from filter state (yyyy-mm-dd, native to <input type="date">)
  const startDateValue = startOp !== 'interval'
    ? (filters[startKeyFor(startOp as SingleDateOp)] as string | undefined) ?? ''
    : '';
  const endDateValue = endOp !== 'interval'
    ? (filters[endKeyFor(endOp as SingleDateOp)] as string | undefined) ?? ''
    : '';

  const startIntervalFrom = (filters.start_date_gte as string | undefined) ?? '';
  const startIntervalTo   = (filters.start_date_lte as string | undefined) ?? '';
  const endIntervalFrom   = (filters.end_date_gte   as string | undefined) ?? '';
  const endIntervalTo     = (filters.end_date_lte   as string | undefined) ?? '';

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">Filtres</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtre Patient */}
        <div>
          <label htmlFor="patient-filter" className="label">Patient</label>
          <select
            id="patient-filter"
            className="input"
            value={filters.patient || ''}
            onChange={(e) => handleChange('patient', e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Tous les patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.last_name} {patient.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Médicament */}
        <div>
          <label htmlFor="medication-filter" className="label">Médicament</label>
          <select
            id="medication-filter"
            className="input"
            value={filters.medication || ''}
            onChange={(e) => handleChange('medication', e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Tous les médicaments</option>
            {medications.map((med) => (
              <option key={med.id} value={med.id}>
                {med.code} - {med.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Statut */}
        <div>
          <label htmlFor="status-filter" className="label">Statut</label>
          <select
            id="status-filter"
            className="input"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value as PrescriptionStatus | undefined)}
          >
            <option value="">Tous les statuts</option>
            {PRESCRIPTION_STATUSES.map((status) => (
              <option key={status} value={status}>{getStatusLabel(status)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtres de dates */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date de début */}
        <div>
          <label className="label">Date de début</label>
          <div className="flex gap-2 items-center flex-wrap">
            <select
              className="input w-32 shrink-0"
              value={startOp}
              onChange={(e) => handleStartOp(e.target.value as DateOp)}
            >
              {DATE_OPS.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            {startOp === 'interval' ? (
              <>
                <input
                  type="date"
                  className="input flex-1 min-w-0"
                  value={startIntervalFrom}
                  onChange={(e) => handleStartIntervalFrom(e.target.value)}
                />
                <span className="text-gray-400 shrink-0">→</span>
                <input
                  type="date"
                  className="input flex-1 min-w-0"
                  value={startIntervalTo}
                  onChange={(e) => handleStartIntervalTo(e.target.value)}
                />
              </>
            ) : (
              <input
                type="date"
                className="input flex-1"
                value={startDateValue}
                onChange={(e) => handleStartDate(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Date de fin */}
        <div>
          <label className="label">Date de fin</label>
          <div className="flex gap-2 items-center flex-wrap">
            <select
              className="input w-32 shrink-0"
              value={endOp}
              onChange={(e) => handleEndOp(e.target.value as DateOp)}
            >
              {DATE_OPS.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            {endOp === 'interval' ? (
              <>
                <input
                  type="date"
                  className="input flex-1 min-w-0"
                  value={endIntervalFrom}
                  onChange={(e) => handleEndIntervalFrom(e.target.value)}
                />
                <span className="text-gray-400 shrink-0">→</span>
                <input
                  type="date"
                  className="input flex-1 min-w-0"
                  value={endIntervalTo}
                  onChange={(e) => handleEndIntervalTo(e.target.value)}
                />
              </>
            ) : (
              <input
                type="date"
                className="input flex-1"
                value={endDateValue}
                onChange={(e) => handleEndDate(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bouton Reset */}
      <div className="mt-4">
        <button type="button" onClick={handleReset} className="btn btn-secondary">
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
};
