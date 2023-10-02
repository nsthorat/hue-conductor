import { createApiMutation, createApiQuery } from './queryUtils';

export const LIGHT_GROUPS = 'light_groups';

export interface GroupAction {
	alert: string;
	bri: number;
	colormode: number;
	ct: number;
	effect: string;
	hue: number;
	on: boolean;
	sat: number;
	xy: [number, number];
}
interface Group {
	name: string;
	action: GroupAction;
}

async function getGroups(ipAddress: string | null, username: string | null) {
	if (ipAddress == null || username == null) return null;
	const response = await fetch(`http://${ipAddress}/api/${username}/groups`);
	const json = await response.json();
	if (json[0]?.error != null) {
		throw new Error(json[0].error.description);
	}
	return json as { [idx: number]: Group };
}
export const queryLightGroups = createApiQuery(getGroups, LIGHT_GROUPS);

export interface Scene {
	name: string;
	type: string;
	group: string;
}
async function getScenes(ipAddress: string | null, username: string | null) {
	if (ipAddress == null || username == null) return null;

	const response = await fetch(`http://${ipAddress}/api/${username}/scenes`);
	const json = await response.json();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	if (json[0]?.error != null) {
		throw new Error(json[0].error.description);
	}
	return json as { [sceneId: string]: Scene };
}

export const queryScenes = createApiQuery(getScenes, 'scenes');

export interface LightUpdate {
	groupId: number;
	action: Partial<GroupAction & { scene: string }>;
}

export async function updateLightGroup(
	updates: LightUpdate[],
	ipAddress: string | null,
	username: string | null
) {
	if (ipAddress == null || username == null) return null;

	const requests = updates.map(({ groupId, action }) => {
		return fetch(`http://${ipAddress}/api/${username}/groups/${groupId}/action`, {
			method: 'PUT',
			body: JSON.stringify(action)
		}).then((response) => response.json());
	});
	return await Promise.all(requests);
}

export const updateLightGroupMutation = createApiMutation(updateLightGroup, {});
