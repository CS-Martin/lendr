'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, User, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { UpdateUserDto, UserDto } from '@repo/shared-dtos';
import { useUpdateUser } from '@/queries/users';

interface ProfileTabProps {
  user: UserDto;
}

export const userSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatarUrl: z.string().url().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

export const ProfileTab = ({ user }: ProfileTabProps) => {
  const { mutateAsync: updateUser } = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
    },
  });

  // Watch for session changes and update form
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        bio: user.bio || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserDto) => {
    try {
      const updatedUser = await updateUser({
        address: user?.address || '',
        user: data,
      });

      reset({
        username: updatedUser?.username,
        bio: updatedUser?.bio,
      });

      toast.success('Profile updated successfully!', {
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      toast.error('Failed to update profile', {
        description: 'Please try again later.',
      });

      reset({
        username: user?.username || '',
        bio: user?.bio || '',
      });

      throw error;
    }
  };

  const bioLength = watch('bio')?.length || 0;

  const copyAddress = () => {
    navigator.clipboard
      .writeText(user?.address || '')
      .then(() => {
        toast.success('Address copied to clipboard!');
      })
      .catch((err) => {
        toast.error('Failed to copy address', err);
      });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}>
      <Card className='bg-gray-900/50 backdrop-blur-sm border-gray-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <User className='w-5 h-5 text-lendr-400' />
            Profile Information
          </CardTitle>
          <CardDescription className='text-gray-400'>Update your profile details and avatar</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Avatar Section */}
          <div className='flex items-center gap-6'>
            <div className='relative'>
              <Avatar className='w-24 h-24 border-4 border-lendr-400/30'>
                <AvatarImage
                  src={user?.avatarUrl || '/avatar-placeholder.webp'}
                  alt='Profile'
                />
                <AvatarFallback className='bg-lendr-400/20 text-lendr-400 text-2xl'>
                  {user?.username?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-white'>{user?.username}</h3>
              <p className='text-gray-400 text-sm'>
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
              <div className='flex items-center gap-2 mt-2'>
                <span className='text-xs font-mono bg-gray-800/50 px-2 py-1 rounded text-gray-300'>
                  {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'No address'}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={copyAddress}
                  className='h-6 w-6 p-0 text-gray-400 hover:text-lendr-400'>
                  <Copy className='w-3 h-3' />
                </Button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label
                  htmlFor='username'
                  className='text-white'>
                  Username
                </Label>
                <Input
                  id='username'
                  {...register('username')}
                  className='bg-gray-800/50 border-gray-700/50 text-white focus:border-lendr-400/50'
                  placeholder='Enter your username'
                />
                {errors.username && <p className='text-xs text-red-400'>{errors.username.message}</p>}
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='wallet'
                  className='text-white'>
                  Wallet Address
                </Label>
                <div className='flex gap-2'>
                  <Input
                    id='wallet'
                    value={user?.address || ''}
                    readOnly
                    className='bg-gray-800/30 border-gray-700/50 text-gray-400 cursor-not-allowed'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='border-gray-700/50 text-gray-400 hover:text-lendr-400 hover:border-lendr-400/50 bg-transparent'
                    onClick={copyAddress}>
                    <Copy className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='bio'
                className='text-white'>
                Bio
              </Label>
              <Textarea
                id='bio'
                {...register('bio')}
                className='bg-gray-800/50 border-gray-700/50 text-white focus:border-lendr-400/50 min-h-[100px]'
                placeholder='Tell us about yourself...'
              />
              <div className='flex justify-between'>
                {errors.bio ? (
                  <p className='text-xs text-red-400'>{errors.bio.message}</p>
                ) : (
                  <span className='text-xs text-gray-500'>{bioLength}/500 characters</span>
                )}
              </div>
            </div>

            {/* Save Button */}
            {isDirty && (
              <motion.div
                className='flex gap-3'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600 text-black font-semibold'>
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                      className='w-4 h-4 mr-2'>
                      <div className='w-full h-full border-2 border-black/30 border-t-black rounded-full' />
                    </motion.div>
                  ) : (
                    <Save className='w-4 h-4 mr-2' />
                  )}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => reset()}
                  className='border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'>
                  <X className='w-4 h-4 mr-2' />
                  Cancel
                </Button>
              </motion.div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
