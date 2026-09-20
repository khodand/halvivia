import { createActivityEvent, CreateActivityEventInput } from '@/entities/activity/api/db';
import { revalidateTag } from 'next/cache';

export async function tryCreateActivityEvent(input: CreateActivityEventInput): Promise<void> {
  try {
    await createActivityEvent(input);

    revalidateTag('activity-feed', {
      expire: 0,
    });
  } catch (error) {
    console.error('Failed to create activity event', {
      error,
      input,
    });
  }
}
