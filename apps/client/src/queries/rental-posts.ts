import { useQuery } from '@tanstack/react-query';
import { rentalPostApiService } from '@/services/rental-posts.api';
import { rentalPostsKeys } from '@/lib/query-keys';

export const useGetRentalPosts = () =>
  useQuery({
    queryKey: rentalPostsKeys.lists(),
    queryFn: () => rentalPostApiService.findAll(),
  });

export const useGetRentalPostById = (id: string) =>
  useQuery({
    queryKey: rentalPostsKeys.detail(id),
    queryFn: () => rentalPostApiService.findById(id),
    enabled: !!id,
  });
