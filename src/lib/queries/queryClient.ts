import { QueryClient } from '@tanstack/svelte-query';
import { writable } from 'svelte/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiErrors = writable<any[]>([]);

interface ApiError {
	body: {
		detail: string;
	};
}
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Dont refetch on window focus
			refetchOnWindowFocus: false,
			// Treat data as never stale, avoiding repeated fetches
			staleTime: Infinity,
			retry: false,
			onError: (err) => {
				console.error((err as ApiError).body?.detail);
				apiErrors.update((errs) => [...errs, err as ApiError]);
			}
		},
		mutations: {
			onError: (err) => {
				console.error((err as ApiError).body?.detail);
				apiErrors.update((errs) => [...errs, err as ApiError]);
			}
		}
	}
});
