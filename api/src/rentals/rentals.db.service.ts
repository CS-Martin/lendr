import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { Rental } from '@prisma/client';
import { UpdateRentalDto } from './dto/update-rental.dto';

@Injectable()
export class RentlsDbService {
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

    async findAll(): Promise<Rental[] | null> {
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
