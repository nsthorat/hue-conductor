import {
	createMutation,
	createQuery,
	type CreateMutationOptions,
	type CreateQueryOptions
} from '@tanstack/svelte-query';

const apiQueryKey = (tags: string[], endpoint: string, ...args: unknown[]) => [
	...tags,
	endpoint,
	...args
];
export function createApiQuery<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TQueryFn extends (...args: any[]) => Promise<any>,
	TQueryFnData = Awaited<ReturnType<TQueryFn>>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TError = any,
	TData = TQueryFnData
>(
	endpoint: TQueryFn,
	tags: string | string[],
	queryArgs: CreateQueryOptions<TQueryFnData, TError, TData> = {}
) {
	tags = Array.isArray(tags) ? tags : [tags];
	return (...args: Parameters<TQueryFn>) =>
		createQuery<TQueryFnData, TError, TData>({
			queryKey: apiQueryKey(tags as string[], endpoint.name, ...args),
			queryFn: () => endpoint(...args),
			// Allow the result of the query to contain non-serializable data, such as `LilacField` which
			// has pointers to parents: https://tanstack.com/query/v4/docs/react/reference/useQuery
			structuralSharing: false,
			...queryArgs
		});
}

export function createApiMutation<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TMutationFn extends (...args: any[]) => Promise<any>,
	TData = Awaited<ReturnType<TMutationFn>>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TError = any,
	TVariables = Parameters<TMutationFn>
>(endpoint: TMutationFn, mutationArgs: CreateMutationOptions<TData, TError, TVariables> = {}) {
	return () =>
		createMutation<TData, TError, TVariables>({
			mutationFn: (args) => endpoint(...(args as unknown[])),
			...mutationArgs
		});
}
