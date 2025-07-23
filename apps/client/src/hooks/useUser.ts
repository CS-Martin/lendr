'use client';

import { userApiService } from '@/services/users.api';
import { useProgress } from '@bprogress/next';
import { UserDto } from '@repo/shared-dtos';
import { useEffect, useState } from 'react';

export const useCreateUser = () => {
  const { start, stop } = useProgress();
  const [error, setError] = useState<Error | null>(null);

  const createUser = async (user: UserDto) => {
    try {
      start();
      await userApiService.create(user);
    } catch (err) {
      setError(err as Error);
    } finally {
      stop();
    }
  };

  return { createUser, error };
};

export const useFindOneUser = (address: string) => {
  const { start, stop } = useProgress();
  const [fetchedUser, setFetchedUser] = useState<UserDto | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findOneUser = async () => {
      try {
        start();
        setLoading(true);
        const res = await userApiService.findOne(address);

        setFetchedUser(res.data || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        stop();
        setLoading(false);
      }
    };

    findOneUser();
  }, [address, start, stop]);

  return { fetchedUser, error, loading };
};
