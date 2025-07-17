import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Rental } from '@prisma/client';
import { CreateRentalDto, UpdateRentalDto } from './dto';

@Injectable()
export class RentalsDbService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createRentalDto: CreateRentalDto): Promise<Rental> {
        const rental = await this.prisma.rental.create({
            data: createRentalDto,
        });

        return rental;
    }

    async update(
        rentalId: number,
        updateRentalDto: UpdateRentalDto,
    ): Promise<Rental> {
        const rental = await this.prisma.rental.update({
            where: {
                rentalId,
            },
            data: updateRentalDto,
        });

        return rental;
    }

    async findAllByAddress(address: string): Promise<Rental[]> {
        const rentals = await this.prisma.rental.findMany({
            where: {
                renterAddress: address,
            },
        });

        return rentals;
    }

    async findAll(): Promise<Rental[]> {
        const rentals = await this.prisma.rental.findMany();

        return rentals;
    }

    async findOne(rentalId: number): Promise<Rental | null> {
        const rental = await this.prisma.rental.findUnique({
            where: {
                rentalId,
            },
        });

        return rental;
    }

    async remove(rentalId: number): Promise<Rental> {
        const rental = await this.prisma.rental.delete({
            where: {
                rentalId,
            },
        });

        return rental;
    }
}
