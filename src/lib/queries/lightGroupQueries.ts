import { queryClient } from './queryClient';
import { createApiMutation } from './queryUtils';
import { createApiQuery } from './queryUtils';

export const LIGHT_GROUPS = 'light_groups';

const POLL_TIME_MS = 10_000;

const ipAddress = '10.10.10.80';
// {"devicetype":"hue_conductor#web"}
const username = 'CyMV-e3MvDaKz8AoAPIWfBs7oaTQ3ArLV-LVy2dn';

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

async function getGroups() {
	console.log('getting groups....');
	const response = await fetch(`http://${ipAddress}/api/${username}/groups`);
	const json = await response.json();
	return json as { [idx: number]: Group };
}
export const queryLightGroups = createApiQuery(getGroups, LIGHT_GROUPS, {
	staleTime: POLL_TIME_MS,
	refetchInterval: POLL_TIME_MS,
	refetchIntervalInBackground: false,
	refetchOnWindowFocus: true
});

export interface LightUpdate {
	groupId: number;
	action: Partial<GroupAction>;
}

export async function updateLightGroup(updates: LightUpdate[]) {
	console.log('~~~~~MAKING REQUEST TO CHANGE LIGHT~~~~', updates);
	const requests = updates.map(({ groupId, action }) => {
		return fetch(`http://${ipAddress}/api/${username}/groups/${groupId}/action`, {
			method: 'PUT',
			body: JSON.stringify(action)
		}).then((response) => response.json());
	});
	return await Promise.all(requests);
}

export const updateLightGroupMutation = createApiMutation(updateLightGroup, {
	onSuccess: () => {
		queryClient.invalidateQueries([LIGHT_GROUPS]);
	}
});
