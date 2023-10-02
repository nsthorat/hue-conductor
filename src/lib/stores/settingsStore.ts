import { getContext, hasContext, setContext } from 'svelte';
import { persisted } from './persistedStore';

const SETTINGS_CONTEXT = 'SETTINGS_CONTEXT';

export type Gesture = keyof GestureSceneMap;
export interface GestureSceneMap {
	None?: string;
	Closed_Fist?: string;
	Open_Palm?: string;
	Pointing_Up?: string;
	Thumb_Down?: string;
	Thumb_Up?: string;
	Victory?: string;
	ILoveYou?: string;
}
export interface SettingsState {
	hubIp: string | null;
	hubUsername: string | null;
	selectedGroup: string | null;
	// Maps a group id to its gesture scene map.
	groupGestureSceneMap: { [key: string]: GestureSceneMap };
}

const LS_KEY = 'settingsStore';

export type SettingsStore = ReturnType<typeof createSettingsStore>;

export function createSettingsStore() {
	const initialState: SettingsState = {
		hubIp: null,
		hubUsername: null,
		selectedGroup: null,
		groupGestureSceneMap: {}
	};
	const { subscribe, set, update } = persisted<SettingsState>(LS_KEY, initialState, {
		storage: 'local'
	});

	return {
		subscribe,
		set,
		update,
		reset() {
			set(JSON.parse(JSON.stringify(initialState)));
		},
		setGroupGestureScene(groupId: string, gesture: string, scene: string) {
			update((settings) => {
				settings.groupGestureSceneMap = settings.groupGestureSceneMap || {};
				settings.groupGestureSceneMap[groupId] = settings.groupGestureSceneMap[groupId] || {};
				const group = settings.groupGestureSceneMap[groupId] ?? {};
				group[gesture as Gesture] = scene;
				settings.groupGestureSceneMap[groupId] = group;
				return settings;
			});
		}
	};
}

export function setSettingsContext(store: SettingsStore) {
	setContext(SETTINGS_CONTEXT, store);
}

export function getSettingsContext(): SettingsStore {
	if (!hasContext(SETTINGS_CONTEXT)) throw new Error('SettingsContext not found');
	return getContext<SettingsStore>(SETTINGS_CONTEXT);
}
