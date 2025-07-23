import { userApiService } from "@/services/users.api";
import { useProgress } from "@bprogress/next";
import { UserDto } from "@repo/shared-dtos";
import { useEffect, useState } from "react";

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
    const [user, setUser] = useState<UserDto | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                start();
                const res = await userApiService.findOne(address);

                setUser(res.data || null);
            } catch (err) {
                setError(err as Error);
            } finally {
                stop();
            }
        };

        fetchData();
    }, [address, start, stop]);

    return { user, error };
};
