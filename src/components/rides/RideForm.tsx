'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import FormField from '@/components/auth/FormField';
import SubmitButton from '@/components/auth/SubmitButton';
import { CITIES } from '@/lib/cities';
import type { FormState } from '@/lib/form-state';

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Record<string, string>;
  submitLabel: string;
};

const emptyState: FormState = {};

const PREFERENCES = [
  { name: 'prefAc', label: 'Air conditioning' },
  { name: 'prefMusic', label: 'Music' },
  { name: 'prefPets', label: 'Pets allowed' },
  { name: 'prefLuggage', label: 'Luggage allowed' },
];

export default function RideForm({ action, initial = {}, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, emptyState);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? initial;
  const value = (name: string) => values[name] ?? '';

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Route</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="From" name="fromCity" list="ride-cities" defaultValue={value('fromCity')} error={errors.fromCity} placeholder="Leaving from" />
          <FormField label="To" name="toCity" list="ride-cities" defaultValue={value('toCity')} error={errors.toCity} placeholder="Going to" />
          <FormField label="Pickup point" name="pickupPoint" defaultValue={value('pickupPoint')} error={errors.pickupPoint} placeholder="For example Kashmere Gate ISBT" />
          <FormField label="Drop point" name="dropPoint" defaultValue={value('dropPoint')} error={errors.dropPoint} placeholder="For example Sector 17 ISBT" />
        </div>
        <datalist id="ride-cities">
          {CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">When</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Departure time (IST)" name="departure" type="datetime-local" defaultValue={value('departure')} error={errors.departure} />
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Trip duration</span>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Hours" name="durationHours" type="number" inputMode="numeric" min={0} max={24} defaultValue={value('durationHours')} invalid={Boolean(errors.duration)} describedBy={errors.duration ? 'duration-error' : undefined} />
              <FormField label="Minutes" name="durationMinutes" type="number" inputMode="numeric" min={0} max={59} defaultValue={value('durationMinutes')} invalid={Boolean(errors.duration)} describedBy={errors.duration ? 'duration-error' : undefined} />
            </div>
            {errors.duration && <span id="duration-error" className="mt-1 block text-sm text-red-600">{errors.duration}</span>}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Price and seats</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Price per seat (₹)" name="pricePerSeat" type="number" inputMode="numeric" min={50} max={5000} defaultValue={value('pricePerSeat')} error={errors.pricePerSeat} />
          <FormField label="Seats available" name="seatsTotal" type="number" inputMode="numeric" min={1} max={6} defaultValue={value('seatsTotal')} error={errors.seatsTotal} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Car and preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Car model" name="carModel" defaultValue={value('carModel')} error={errors.carModel} placeholder="For example Maruti Swift" />
          <FormField label="Car color" name="carColor" defaultValue={value('carColor')} error={errors.carColor} placeholder="For example White" />
        </div>
        <fieldset>
          <legend className="sr-only">Preferences</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {PREFERENCES.map((pref) => (
              <label key={pref.name} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name={pref.name}
                  defaultChecked={value(pref.name) === 'on'}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                {pref.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:w-48">
          <SubmitButton pendingText="Saving...">{submitLabel}</SubmitButton>
        </div>
        <Link href="/my-rides" className="text-center text-sm font-semibold text-brand-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
