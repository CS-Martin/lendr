'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, Loader2, Clock, DollarSign, Shield, Tag, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { OwnedNft } from 'alchemy-sdk';
import LendrButton from '@/components/shared/lendr-btn';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRentalPost } from '@/hooks/useRentalPost';
import { CreateRentalPostDto } from '@repo/shared-dtos';
import { Session } from 'next-auth';
import { toast } from 'sonner';
import { nftApiService } from '@/services/nft.api';

interface ListNFTDrawerProps {
    nft: OwnedNft | null;
    isOpen: boolean;
    onClose: () => void;
    session: Session | null;
    profileAddress: string;
}

// RentalPost Zod Schema
const listNftFormSchema = z.object({
    posterAddress: z.string().min(1, 'Poster address is required'),
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    imageUrl: z.string().url(),
    tokenType: z.string().min(1, 'Token type is required'),
    collectionName: z.string().optional(),
    description: z.string().max(255, 'Description must be less than 500 characters').optional(),
    category: z.string().optional(),
    hourlyRate: z.number().min(0, 'Hourly rate must be greater than 0').positive('Hourly rate must be a positive number'),
    collateral: z.number().min(0, 'Collateral must be greater than or equal to 0').positive(),
    isBiddable: z.boolean(),
    biddingStarttime: z.date().optional(),
    biddingEndtime: z.date().optional(),
    isActive: z.boolean(),
    status: z.enum(['AVAILABLE', 'RENTED', 'DELISTED', 'DISPUTED_FOR_LENDER', 'DISPUTED_FOR_RENTER']),
});

type ListNftFormInputs = z.infer<typeof listNftFormSchema>;

export const ListNFTDrawer = ({ nft, isOpen, onClose, session, profileAddress }: ListNFTDrawerProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { createRentalPost } = useCreateRentalPost();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        control,
    } = useForm<ListNftFormInputs>({
        resolver: zodResolver(listNftFormSchema),
        defaultValues: {
            posterAddress: session?.user?.address,
            name: '',
            imageUrl: nft?.image.thumbnailUrl || nft?.image.cachedUrl || '/placeholder.svg',
            tokenType: nft?.tokenType || '',
            collectionName: nft?.collection?.name || '',
            description: '',
            hourlyRate: 0,
            collateral: 0,
            category: '',
            isBiddable: false,
            biddingStarttime: undefined,
            biddingEndtime: undefined,
            isActive: true,
            status: 'AVAILABLE',
        },
    });

    const onSubmit = async (data: ListNftFormInputs) => {
        setIsSubmitting(true);

        if (!session) {
            console.error('User is not authenticated');
            return null;
        }

        try {
            // Store the NFT to database
            const createdNft = await nftApiService.create({
                contractAddress: nft?.contract.address || '',
                tokenId: nft?.tokenId || '',
                ownerAddress: session.user.address || '',
                title: nft?.name || '',
                imageUrl: nft?.image.thumbnailUrl || nft?.image.cachedUrl || '/placeholder.svg',
                description: data.description || '',
                category: data.category || '',
                floorPrice: 0,
                collectionName: nft?.collection?.name || '',
                metadata: nft ? JSON.parse(JSON.stringify(nft)) : null,
            });


            if (createdNft) {
                // Create the rental post
                const post = await createRentalPost(data as CreateRentalPostDto);

                toast.success('Rental post created successfully');
            }
        } catch (error) {
            console.error('Error creating NFT rental listing:', error);

            toast.error('Failed to create rental post', {
                description: error instanceof Error ? error.message : 'An unknown error occurred',
            });

            return;
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    const categories = [
        'Gaming',
        'Art',
        'Music',
        'Sports',
        'Collectibles',
        'Virtual Worlds',
        'Photography',
        'Utility',
        'Memes',
        'Other',
    ];

    const isBiddable = watch('isBiddable');
    const biddingStarttime = watch('biddingStarttime');
    const biddingEndtime = watch('biddingEndtime');

    return (
        <Sheet
            open={isOpen}
            onOpenChange={onClose}>
            <SheetContent className='w-full px-5 sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border-gray-800/50 text-white overflow-y-auto'>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className='h-full'>
                            <SheetHeader className='mb-3'>
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}>
                                    <SheetTitle className='text-2xl font-bold bg-gradient-to-r from-lendr-400 to-cyan-400 bg-clip-text text-transparent'>
                                        List NFT for Rent
                                    </SheetTitle>
                                    <SheetDescription className='text-gray-400 mt-2'>
                                        Set up your NFT rental listing with custom terms and pricing
                                    </SheetDescription>
                                </motion.div>
                            </SheetHeader>

                            {nft && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className='mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50'>
                                    <div className='flex items-center gap-4'>
                                        <div className='relative w-16 h-16 rounded-lg overflow-hidden'>
                                            <Image
                                                src={nft.image.thumbnailUrl || nft.image.cachedUrl || '/placeholder.svg'}
                                                alt={nft.name || 'NFT'}
                                                fill
                                                unoptimized
                                                className='object-cover'
                                            />
                                        </div>
                                        <div>
                                            <h3 className='font-semibold text-white'>{nft.name}</h3>
                                            <p className='text-sm text-gray-400'>{nft.collection?.name}</p>
                                            <p className='text-xs text-gray-500'>Token #{nft.tokenId}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className='space-y-6'>
                                {/* Basic Information */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className='space-y-4'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <Tag className='h-5 w-5 text-lendr-400' />
                                        <h3 className='text-lg font-semibold text-white'>Basic Information</h3>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label
                                            htmlFor='name'
                                            className='text-gray-300'>
                                            Listing Name
                                        </Label>
                                        <Input
                                            id='name'
                                            {...register('name')}
                                            placeholder='Enter a catchy name for your listing'
                                            className='bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-lendr-400/50'
                                            required
                                        />
                                        {errors.name && <small className='text-red-400 mt-1'>{errors.name.message}</small>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label
                                            htmlFor='description'
                                            {...register}
                                            className='text-gray-300'>
                                            Description
                                        </Label>
                                        <Textarea
                                            id='description'
                                            {...register('description')}
                                            placeholder='Describe your NFT and rental terms...'
                                            className='bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-lendr-400/50 min-h-[100px]'
                                            rows={4}
                                        />
                                        {errors.description && <small className='text-red-400 mt-1'>{errors.description.message}</small>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label
                                            htmlFor='category'
                                            className='text-gray-300'>
                                            Category
                                        </Label>
                                        <Controller
                                            name='category'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}>
                                                    <SelectTrigger className='bg-gray-800/50 border-gray-700/50 text-white focus:border-lendr-400/50'>
                                                        <SelectValue placeholder='Select a category' />
                                                    </SelectTrigger>
                                                    <SelectContent className='bg-gray-800 border-gray-700 text-white'>
                                                        {categories.map((category) => (
                                                            <SelectItem
                                                                key={category}
                                                                value={category.toLowerCase()}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.category && <small className='text-red-400 mt-1'>{errors.category.message}</small>}
                                    </div>
                                </motion.div>

                                {/* Pricing */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className='space-y-4'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <DollarSign className='h-5 w-5 text-green-400' />
                                        <h3 className='text-lg font-semibold text-white'>Pricing</h3>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='space-y-2'>
                                            <Label
                                                htmlFor='hourlyRate'
                                                className='text-gray-300'>
                                                Hourly Rate (ETH)
                                            </Label>
                                            <div className='relative'>
                                                <Clock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                                                <Input
                                                    id='hourlyRate'
                                                    type='number'
                                                    step='0.001'
                                                    {...register('hourlyRate', {
                                                        valueAsNumber: true,
                                                    })}
                                                    placeholder='0.001'
                                                    className='pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-lendr-400/50'
                                                    required
                                                />
                                            </div>
                                            {errors.hourlyRate && <small className='text-red-400 mt-1'>{errors.hourlyRate.message}</small>}
                                        </div>

                                        <div className='space-y-2'>
                                            <Label
                                                htmlFor='collateral'
                                                className='text-gray-300'>
                                                Collateral (ETH)
                                            </Label>
                                            <div className='relative'>
                                                <Shield className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                                                <Input
                                                    id='collateral'
                                                    type='number'
                                                    step='0.001'
                                                    {...register('collateral', { valueAsNumber: true })}
                                                    placeholder='0.1'
                                                    className='pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-lendr-400/50'
                                                    required
                                                />
                                            </div>
                                            {errors.collateral && <small className='text-red-400 mt-1'>{errors.collateral.message}</small>}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Bidding Options */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className='space-y-4'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <CalendarDays className='h-5 w-5 text-purple-400' />
                                        <h3 className='text-lg font-semibold text-white'>Bidding Options</h3>
                                    </div>

                                    <div className='flex items-center justify-between p-4 rounded-lg border border-gray-700/50'>
                                        <div>
                                            <Label
                                                htmlFor='isBiddable'
                                                className='text-gray-300 font-medium'>
                                                Enable Bidding
                                            </Label>
                                            <p className='text-sm text-gray-400 mt-1'>Allow users to bid on your rental listing</p>
                                        </div>
                                        <Switch
                                            id='isBiddable'
                                            className={`data-[state=checked]:bg-lendr-500 data-[state=unchecked]:bg-neutral-600`}
                                            checked={isBiddable}
                                            onCheckedChange={(checked) => {
                                                setValue('isBiddable', checked);
                                                // Reset dates when disabling bidding
                                                if (!checked) {
                                                    setValue('biddingStarttime', undefined);
                                                    setValue('biddingEndtime', undefined);
                                                }
                                            }}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {isBiddable && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className='space-y-4 overflow-hidden'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    <div className='space-y-2'>
                                                        <Label className='text-gray-300'>Bidding Start Date</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant='outline'
                                                                    className={cn(
                                                                        'w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50',
                                                                        !biddingStarttime && 'text-gray-400',
                                                                    )}>
                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                    {biddingStarttime ? format(biddingStarttime, 'PPP') : 'Pick a date'}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className='w-auto p-0 bg-gray-800 border-gray-700'>
                                                                <Calendar
                                                                    mode='single'
                                                                    selected={biddingStarttime}
                                                                    onSelect={(date) => {
                                                                        if (date) {
                                                                            setValue('biddingStarttime', date);
                                                                            if (biddingEndtime && date > biddingEndtime) {
                                                                                setValue('biddingEndtime', undefined);
                                                                            }
                                                                        }
                                                                    }}
                                                                    disabled={(date) => date < new Date()}
                                                                    initialFocus
                                                                    className='text-white'
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        {errors.biddingStarttime && (
                                                            <p className='text-sm text-red-400'>{errors.biddingStarttime.message}</p>
                                                        )}
                                                    </div>

                                                    <div className='space-y-2'>
                                                        <Label className='text-gray-300'>Bidding End Date</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant='outline'
                                                                    className={cn(
                                                                        'w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50',
                                                                        !biddingEndtime && 'text-gray-400',
                                                                    )}
                                                                    disabled={!biddingStarttime}>
                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                    {biddingEndtime ? format(biddingEndtime, 'PPP') : 'Pick a date'}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className='w-auto p-0 bg-gray-800 border-gray-700'>
                                                                <Calendar
                                                                    mode='single'
                                                                    selected={biddingEndtime}
                                                                    onSelect={(date) => {
                                                                        if (date) {
                                                                            if (biddingStarttime && date < biddingStarttime) {
                                                                                // Show error if end date is before start date
                                                                                setValue('biddingEndtime', undefined);
                                                                                alert('Bidding end date must be after start date');
                                                                                return;
                                                                            }
                                                                            setValue('biddingEndtime', date);
                                                                        }
                                                                    }}
                                                                    disabled={(date) =>
                                                                        date < new Date() || (biddingStarttime ? date < biddingStarttime : false)
                                                                    }
                                                                    initialFocus
                                                                    className='text-white'
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        {errors.biddingEndtime && (
                                                            <p className='text-sm text-red-400'>{errors.biddingEndtime.message}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {biddingStarttime && biddingEndtime && biddingEndtime < biddingStarttime && (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className='text-sm text-red-400'>
                                                        Bidding end date must be after start date
                                                    </motion.p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Submit Button */}
                                {/* {session?.user.address === profileAddress && ( */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className='flex flex-col-reverse md:flex-row w-full gap-4 py-3'>
                                    <div className='md:w-1/2'>
                                        <LendrButton
                                            type='button'
                                            variant='outline'
                                            onClick={onClose}
                                            className='w-full border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent'
                                            disabled={isSubmitting}>
                                            Cancel
                                        </LendrButton>
                                    </div>
                                    <div className='md:w-1/2'>
                                        <LendrButton
                                            type='submit'
                                            className='w-full bg-gradient-to-r rounded-md from-lendr-400 hover:to-lendr-600 text-slate-950 font-semibold'
                                            disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <motion.div
                                                    className='flex items-center gap-2'
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}>
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                    Creating Listing...
                                                </motion.div>
                                            ) : (
                                                'Create Listing'
                                            )}
                                        </LendrButton>
                                    </div>
                                </motion.div>
                                {/* )} */}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    );
};
