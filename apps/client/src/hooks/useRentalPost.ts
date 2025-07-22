import { useEffect, useState } from 'react';
import { CreateRentalPostDto, RentalPostDto } from '@repo/shared-dtos';
import { rentalPostApiService } from '@/services/rental-posts.api';
import { useProgress } from '@bprogress/next';

export const useCreateRentalPost = () => {
    const { start, stop } = useProgress();
    const [error, setError] = useState<Error | null>(null);

    const createRentalPost = async (rentalPost: CreateRentalPostDto) => {
        try {
            start();
            await rentalPostApiService.create(rentalPost);
        } catch (err) {
            setError(err as Error);
        } finally {
            stop();
        }
    };

    return { createRentalPost, error };
};

export const useFindAllRentalPost = () => {
    const { start, stop } = useProgress();
    const [rentalPosts, setRentalPosts] = useState<RentalPostDto[]>([]);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                start();
                const res = await rentalPostApiService.findAll();

                setRentalPosts(res.data || [] as RentalPostDto[]);
            } catch (err) {
                setError(err as Error);
            } finally {
                stop();
            }
        };

        fetchData();
    }, [start, stop]);

    return { rentalPosts, error };
};