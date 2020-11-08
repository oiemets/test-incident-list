import { createCustomElement, actionTypes} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import '@servicenow/now-loader';
import '@servicenow/now-template-card';
import { createHttpEffect } from '@servicenow/ui-effect-http';

const {COMPONENT_BOOTSTRAPPED} = actionTypes;

const view = (state) => {
	return (
		<div className="container">
			{state.loader ? <now-loader label="loading..." size="lg"/> : ''}
			{
				state.incidents.map(i=>{
					return <now-template-card-assist
						tagline={{icon: 'tree-view-long-outline', label: 'Incident'}}
						actions={[{id: 'share', label: 'Copy URL'}, {id: 'close', label: 'Mark Complete'}]}
						heading={{label: i.short_description}}
						content={[
							{label: 'Number', value: {type: 'string', value: i.number}},
							{label: 'State', value: {type: 'string', value: i.state}},
							{label: 'Assignment Group', value: {type: 'string', value: i.assignment_group.display_value}},
							{label: 'Assigned To', value: {type: 'string', value: i.assigned_to.display_value}}
						]}
						footerContent={{label: 'Updated', value: i.sys_updated_on}}
					/>
				})
			}
		</div>
	);
};


const getIncidents = createHttpEffect('api/now/table/incident?sysparm_display_value=true', {
	method: 'GET',
	successActionType: 'INCIDENTS_FETCH_SUCCEEDED'
});

createCustomElement('x-550136-incident-list', {
	initialState: {
		loader: true,
		incidents: []
	},
	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: (coeffects) => {
			const {dispatch} = coeffects;
			dispatch('INCIDENTS_FETCH_STARTED');	
		},
		'INCIDENTS_FETCH_STARTED': getIncidents,

		'INCIDENTS_FETCH_SUCCEEDED': (coeffects) => {
				const {action, updateState} = coeffects;
				const {result} = action.payload;
				updateState({incidents: result, loader: false})
		}
	},
	renderer: {type: snabbdom},
	view,
	styles
});
