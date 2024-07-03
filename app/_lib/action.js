'use server';

import { revalidatePath } from 'next/cache';
import { auth, signIn, signOut } from './auth';
import { supabase } from './supabase';
import { getBookings } from './data-service';
import { redirect } from 'next/navigation';

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');
  Object.entries(formData.entries());
  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get('numGuests')),
    observations: formData.get('observations').slice(0,1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice(),
    isPaid: false,
    hasBreakfast: false,
    status: 'unconfirmed',
  };

     const {  error } = await supabase
    .from('bookings')
    .insert([newBooking])
    // So that the newly created object gets returned!
    .select()
    .single();

  if (error) {
    throw new Error('Booking could not be created');
  }

revalidatePath(`/cabin/${bookingData.cabinId}`)
redirect('/thanks')
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingIds = guestBookings.map((b) => b.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error('You are not allowed to delete this booking');

  const { error } = await supabase.from('bookings').delete().eq('id', id);

  if (error) {
    throw new Error('Booking could not be deleted');
  }
  revalidatePath('/account/reservations');
}

export async function editResrvation(formData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const guestBookings = await getBookings(session.user.guestId);
  const bookingId = Number(formData.get('bookingId'));

  const guestBookingIds = guestBookings.map((b) => b.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error('You are not allowed to delete this booking');
  const updatedData = {
    numGuests: Number(formData.get('numGuests')),
    observation: formData.get('observations').slice(0, 1000),
  };
  const { error } = await supabase
    .from('bookings')
    .update(updatedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error('Booking could not be updated');
  }
  revalidatePath(`/account/reservation/edit/${bookingId}`);
  redirect('/account/reservation');
}

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const nationalID = formData.get('nationalID');
  const [nationality, countryFlag] = formData.get('nationality').split('%');

  // if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
  //   throw new Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };

  const { data, error } = await supabase
    .from('guests')
    .update(updateData)
    .eq('id', session.user.guestId);

  if (error) throw new Error('Guest could not be updated');

  revalidatePath('/account/profile');
}

export async function signInAction() {
  await signIn('google', {
    redirectTo: '/account',
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: '/',
  });
}
