'use client';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
export const useRouteParams = () => {
    const params = useParams();
    const slug = useMemo(() => {
        if (Array.isArray(params.slug)) {
            return params.slug[0];
        }
        return params.slug as string;
    }, [params.slug]);

    return { slug };
};