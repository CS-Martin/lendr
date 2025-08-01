/**
 * Query Keys
 *
 * @description
 * These keys are used to cache and invalidate rental posts data in the application.
 */

export const rentalPostsKeys = {
  all: ['rental-posts'],
  lists: () => [...rentalPostsKeys.all, 'list'],
  list: (filters: string) => [...rentalPostsKeys.lists(), { filters }],
  details: () => [...rentalPostsKeys.all, 'detail'],
  detail: (id: string) => [...rentalPostsKeys.details(), id],
};

export const usersKeys = {
  all: ['users'],
  lists: () => [...usersKeys.all, 'list'],
  list: (filters: string) => [...usersKeys.lists(), { filters }],
  details: () => [...usersKeys.all, 'detail'],
  detail: (address: string) => [...usersKeys.details(), address],
};
