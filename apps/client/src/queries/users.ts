import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApiService } from '@/services/users.api';
import { usersKeys } from '@/lib/query-keys';
import { ResponseDto, UpdateUserDto, UserDto } from '@repo/shared-dtos';
import { useSession } from 'next-auth/react';

export const useGetUserByAddress = (address: string) =>
  useQuery({
    queryKey: usersKeys.detail(address),
    queryFn: () => userApiService.findOne(address),
    enabled: !!address, // Only run the query if the address is not empty
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseDto<UserDto>, Error, UserDto>({
    mutationFn: (user: UserDto) => userApiService.create(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { update } = useSession();

  return useMutation<ResponseDto<UserDto>, Error, { address: string; user: UpdateUserDto }>({
    mutationFn: ({ address, user }) => userApiService.update(address, user),
    onSuccess: (data, variables) => {
      // Invalidate the user query to refetch the latest data
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.address),
      });

      // Update the next-auth session
      update({
        user: {
          ...data.data,
          address: variables.address,
        },
      });
    },
  });
};
