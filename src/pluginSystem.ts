import { createHooks, Hook } from 'krog';
import { Collection } from './collectionGenerator';

export type Plugin = {
	name: string;
	hooks: Partial<AvailableHooks>;
};

export type AvailableHooks = {
	'before:write_collections': Hook<{ collections: Collection[] }>;
};

export function initializePlugins(plugins: Plugin[]) {
	const hooks = createHooks<AvailableHooks>();
	plugins?.forEach((plugin) => {
		Object.entries(plugin.hooks).forEach(([key, hook]) => {
			hooks.register(
				key as keyof AvailableHooks,
				hook as AvailableHooks[keyof AvailableHooks]
			);
		});
	});
	return hooks;
}
