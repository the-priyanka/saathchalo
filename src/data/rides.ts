import type { Ride } from '@/lib/types';

export type RideTemplate = Omit<Ride, 'departureTime' | 'status'> & {
  /** Days after today (IST). Must be between 1 and 14. */
  dayOffset: number;
  /** HH:MM, 24 hour, IST */
  time: string;
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const rideTemplates: RideTemplate[] = [
  {
    id: 'r1', from: 'Delhi', to: 'Chandigarh', pickupPoint: 'Kashmere Gate ISBT', dropPoint: 'Sector 17 ISBT',
    dayOffset: 1, time: '06:30', durationMins: 300, pricePerSeat: 450, seatsLeft: 3, seatsTotal: 4, driverId: 'd1',
    car: { model: 'Maruti Swift', color: 'White' },
    preferences: { ac: true, music: true, pets: false, luggage: true },
  },
  {
    id: 'r2', from: 'Delhi', to: 'Chandigarh', pickupPoint: 'Anand Vihar', dropPoint: 'Sector 43 Bus Stand',
    dayOffset: 1, time: '14:00', durationMins: 300, pricePerSeat: 520, seatsLeft: 2, seatsTotal: 3, driverId: 'd3',
    car: { model: 'Hyundai i20', color: 'Grey' },
    preferences: { ac: true, music: false, pets: false, luggage: true },
  },
  {
    id: 'r3', from: 'Delhi', to: 'Chandigarh', pickupPoint: 'Dhaula Kuan', dropPoint: 'Sector 22',
    dayOffset: 2, time: '18:30', durationMins: 330, pricePerSeat: 400, seatsLeft: 1, seatsTotal: 4, driverId: 'd5',
    car: { model: 'Maruti Ertiga', color: 'Silver' },
    preferences: { ac: true, music: true, pets: true, luggage: false },
  },
  {
    id: 'r4', from: 'Mumbai', to: 'Pune', pickupPoint: 'Dadar TT', dropPoint: 'Shivajinagar',
    dayOffset: 1, time: '07:00', durationMins: 180, pricePerSeat: 350, seatsLeft: 3, seatsTotal: 4, driverId: 'd2',
    car: { model: 'Honda City', color: 'Silver' },
    preferences: { ac: true, music: true, pets: false, luggage: true },
  },
  {
    id: 'r5', from: 'Mumbai', to: 'Pune', pickupPoint: 'Vashi', dropPoint: 'Hinjewadi Phase 1',
    dayOffset: 2, time: '17:30', durationMins: 210, pricePerSeat: 300, seatsLeft: 2, seatsTotal: 3, driverId: 'd4',
    car: { model: 'Toyota Innova', color: 'White' },
    preferences: { ac: true, music: true, pets: true, luggage: true },
  },
  {
    id: 'r6', from: 'Pune', to: 'Mumbai', pickupPoint: 'Swargate', dropPoint: 'Andheri East',
    dayOffset: 3, time: '09:00', durationMins: 195, pricePerSeat: 380, seatsLeft: 3, seatsTotal: 4, driverId: 'd6',
    car: { model: 'Kia Seltos', color: 'Grey' },
    preferences: { ac: true, music: true, pets: false, luggage: true },
  },
  {
    id: 'r7', from: 'Bengaluru', to: 'Mysuru', pickupPoint: 'Silk Board', dropPoint: 'Mysuru Bus Stand',
    dayOffset: 2, time: '06:00', durationMins: 180, pricePerSeat: 280, seatsLeft: 2, seatsTotal: 4, driverId: 'd7',
    car: { model: 'Tata Nexon', color: 'Blue' },
    preferences: { ac: true, music: true, pets: false, luggage: true },
  },
  {
    id: 'r8', from: 'Bengaluru', to: 'Mysuru', pickupPoint: 'Majestic', dropPoint: 'Mysuru Palace',
    dayOffset: 4, time: '16:00', durationMins: 195, pricePerSeat: 250, seatsLeft: 3, seatsTotal: 3, driverId: 'd8',
    car: { model: 'Maruti Ertiga', color: 'White' },
    preferences: { ac: false, music: true, pets: false, luggage: true },
  },
  {
    id: 'r9', from: 'Hyderabad', to: 'Vijayawada', pickupPoint: 'Uppal', dropPoint: 'Benz Circle',
    dayOffset: 3, time: '05:30', durationMins: 300, pricePerSeat: 600, seatsLeft: 4, seatsTotal: 4, driverId: 'd6',
    car: { model: 'Kia Seltos', color: 'Grey' },
    preferences: { ac: true, music: true, pets: false, luggage: true },
  },
  {
    id: 'r10', from: 'Hyderabad', to: 'Vijayawada', pickupPoint: 'LB Nagar', dropPoint: 'Vijayawada Bus Station',
    dayOffset: 5, time: '15:00', durationMins: 330, pricePerSeat: 550, seatsLeft: 1, seatsTotal: 3, driverId: 'd3',
    car: { model: 'Hyundai Creta', color: 'Black' },
    preferences: { ac: true, music: true, pets: false, luggage: true },
  },
  {
    id: 'r11', from: 'Jaipur', to: 'Delhi', pickupPoint: 'Sindhi Camp', dropPoint: 'Dhaula Kuan',
    dayOffset: 6, time: '07:30', durationMins: 330, pricePerSeat: 550, seatsLeft: 2, seatsTotal: 4, driverId: 'd4',
    car: { model: 'Honda Amaze', color: 'White' },
    preferences: { ac: true, music: true, pets: false, luggage: true },
  },
  {
    id: 'r12', from: 'Ahmedabad', to: 'Vadodara', pickupPoint: 'Iscon Cross Roads', dropPoint: 'Alkapuri',
    dayOffset: 7, time: '08:00', durationMins: 120, pricePerSeat: 250, seatsLeft: 3, seatsTotal: 4, driverId: 'd7',
    car: { model: 'Tata Nexon', color: 'Blue' },
    preferences: { ac: true, music: true, pets: true, luggage: true },
  },
  {
    id: 'r13', from: 'Chennai', to: 'Pondicherry', pickupPoint: 'Guindy', dropPoint: 'White Town',
    dayOffset: 9, time: '09:30', durationMins: 180, pricePerSeat: 300, seatsLeft: 2, seatsTotal: 3, driverId: 'd2',
    car: { model: 'Honda City', color: 'Silver' },
    preferences: { ac: true, music: true, pets: false, luggage: true },
  },
  {
    id: 'r14', from: 'Lucknow', to: 'Kanpur', pickupPoint: 'Charbagh', dropPoint: 'Kanpur Central',
    dayOffset: 12, time: '11:00', durationMins: 90, pricePerSeat: 180, seatsLeft: 3, seatsTotal: 4, driverId: 'd5',
    car: { model: 'Maruti Swift', color: 'Red' },
    preferences: { ac: false, music: true, pets: true, luggage: false },
  },
];

/** Builds the mock rides relative to `now`, so the demo never goes stale. */
export function buildRides(now: Date): Ride[] {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const todayUtcMidnight = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());

  return rideTemplates.map(({ dayOffset, time, ...ride }) => {
    const date = new Date(todayUtcMidnight + dayOffset * DAY_MS).toISOString().slice(0, 10);
    return { ...ride, status: 'active' as const, departureTime: `${date}T${time}:00+05:30` };
  });
}
