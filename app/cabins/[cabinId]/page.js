import Cabin from '@/app/_components/Cabin';
import Reservation from '@/app/_components/Reservation';
import Spinner from '@/app/_components/Spinner';
import { getCabin } from '@/app/_lib/data-service';
import { Suspense } from 'react';

export async function generateMetadata({ params }) {
  const { name } = await getCabin(params.cabinId);

  if (!name) return null;
  return {
    title: `Cabin ${name}`,
  };
}

export default async function Page({ params }) {
  // const [cabin , setting , bookedDates]= Promise.all([getCabin(params.cabinId),getSettings(),getBookedDatesByCabinId(params.cabinId) ])
  // const setting = await getSettings()
  // const bookedDates = await getBookedDatesByCabinId(params.cabinId)
  const cabin = await getCabin(params.cabinId);
  return (
    <div className='max-w-6xl mx-auto mt-8'>
      <Cabin cabin={cabin} />

      <div>
        <h2 className='text-5xl font-semibold text-center mb-10 text-accent-50'>
          Reserve {cabin.name} today. Pay on arrival.
        </h2>
        <Suspense fallback={<Spinner />}>
          <Reservation cabin={cabin} />
        </Suspense>
      </div>
    </div>
  );
}
